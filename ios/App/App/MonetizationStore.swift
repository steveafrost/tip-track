import Foundation
import os
import StoreKit

@MainActor
final class MonetizationStore: ObservableObject {
    static let unlockProductID = "com.steveafrost.tiptrack.pro.unlock.v2"
    static let legacyUnlockProductID = "com.steveafrost.tiptrack.pro.unlock"
    static let freeOrderLimit = 20
    private static let logger = Logger(subsystem: "com.steveafrost.tiptrack", category: "StoreKit")
    private static let productLoadAttempts = 3
    private static let productLoadRetryDelayNanoseconds: UInt64 = 1_000_000_000
    private static let productLoadTimeoutNanoseconds: UInt64 = 12_000_000_000

    @Published private(set) var products: [Product] = []
    @Published private(set) var purchasedProductIDs: Set<String> = []
    @Published private(set) var productLoadDiagnostic: String?
    @Published var errorMessage: String?
    @Published var isLoading = false

    private var updatesTask: Task<Void, Never>?

    var isPro: Bool {
        !purchasedProductIDs.isDisjoint(with: Self.productIDs)
    }

    var sortedProducts: [Product] {
        let rankedProducts = products.sorted { left, right in
            productRank(left.id) < productRank(right.id)
        }

        if let currentProduct = rankedProducts.first(where: { $0.id == Self.unlockProductID }) {
            return [currentProduct]
        }

        return rankedProducts
    }

    private static var productIDs: Set<String> {
        [unlockProductID, legacyUnlockProductID]
    }

    init() {
        updatesTask = Task { [weak self] in
            for await result in Transaction.updates {
                guard let self else { return }
                await self.handle(result)
            }
        }
    }

    deinit {
        updatesTask?.cancel()
    }

    func start() async {
        await refreshEntitlements()
        await refreshProducts()
    }

    func refreshProducts(force: Bool = false) async {
        guard !isLoading else { return }
        guard force || products.isEmpty else { return }

        isLoading = true
        errorMessage = nil
        productLoadDiagnostic = nil
        defer { isLoading = false }

        do {
            let loadedProducts = try await Self.loadProductsWithRetry()
            products = loadedProducts

            if loadedProducts.isEmpty {
                Self.logger.error("StoreKit returned zero products after all retry attempts.")
                productLoadDiagnostic = "StoreKit returned no product for \(Self.productIDs.sorted().joined(separator: ", ")). Confirm the Paid Apps Agreement is active and the in-app purchases are cleared for testing/review in App Store Connect."
                errorMessage = "TipTrack Pro is not available from the App Store yet. Please try again in a moment."
            }
        } catch {
            Self.logger.error("StoreKit product loading failed: \(String(describing: error), privacy: .public)")
            productLoadDiagnostic = "StoreKit product request failed for \(Self.productIDs.sorted().joined(separator: ", ")): \(Self.describeStoreKitError(error))."
            errorMessage = "Unable to load Pro options. Please try again."
        }
    }

    func purchase(_ product: Product) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let result = try await product.purchase()

            switch result {
            case .success(let verification):
                guard case .verified(let transaction) = verification else {
                    errorMessage = "The purchase could not be verified."
                    return
                }

                purchasedProductIDs.insert(transaction.productID)
                await transaction.finish()
            case .pending:
                errorMessage = "The purchase is pending approval."
            case .userCancelled:
                break
            @unknown default:
                errorMessage = "The purchase could not be completed."
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func restorePurchases() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await AppStore.sync()
            await refreshEntitlements()
        } catch {
            errorMessage = "Unable to restore purchases. Please try again."
        }
    }

    func canAddOrder(currentOrderCount: Int) -> Bool {
        isPro || currentOrderCount < Self.freeOrderLimit
    }

    func remainingFreeOrders(currentOrderCount: Int) -> Int {
        max(Self.freeOrderLimit - currentOrderCount, 0)
    }

    func syncActiveEntitlements(with store: TipTrackStore) async {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            guard Self.productIDs.contains(transaction.productID) else { continue }

            do {
                _ = try await store.syncAppleEntitlement(
                    signedTransactionInfo: result.jwsRepresentation
                )
            } catch {
                errorMessage = "Unable to sync Pro unlock to the web dashboard."
            }
        }
    }

    private func refreshEntitlements() async {
        var activeProductIDs = Set<String>()

        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            guard Self.productIDs.contains(transaction.productID) else { continue }
            activeProductIDs.insert(transaction.productID)
        }

        purchasedProductIDs = activeProductIDs
    }

    private func handle(_ result: VerificationResult<Transaction>) async {
        guard case .verified(let transaction) = result else { return }

        await refreshEntitlements()
        await transaction.finish()
    }

    private func productRank(_ productID: String) -> Int {
        switch productID {
        case Self.unlockProductID:
            return 0
        case Self.legacyUnlockProductID:
            return 1
        default:
            return 2
        }
    }

    private static func loadProductsWithTimeout() async throws -> [Product] {
        try await withThrowingTaskGroup(of: [Product].self) { group in
            group.addTask {
                try await Product.products(for: Array(productIDs))
            }

            group.addTask {
                try await Task.sleep(nanoseconds: productLoadTimeoutNanoseconds)
                throw StoreKitProductLoadError.timeout
            }

            guard let products = try await group.next() else {
                throw StoreKitProductLoadError.timeout
            }

            group.cancelAll()
            return products
        }
    }

    private static func loadProductsWithRetry() async throws -> [Product] {
        var lastError: Error?

        for attempt in 1...productLoadAttempts {
            do {
                logger.info("Loading StoreKit products. attempt=\(attempt, privacy: .public)")

                let loadedProducts = try await loadProductsWithTimeout()

                if !loadedProducts.isEmpty {
                    logger.info("Loaded StoreKit products. count=\(loadedProducts.count, privacy: .public)")
                    return loadedProducts
                }

                logger.warning("StoreKit returned zero products. attempt=\(attempt, privacy: .public)")
            } catch {
                lastError = error
                logger.error("StoreKit product request failed. attempt=\(attempt, privacy: .public) error=\(String(describing: error), privacy: .public)")
            }

            guard attempt < productLoadAttempts else { break }
            try await Task.sleep(nanoseconds: productLoadRetryDelayNanoseconds)
        }

        if let lastError {
            throw lastError
        }

        return []
    }

    private static func describeStoreKitError(_ error: Error) -> String {
        if let storeKitError = error as? StoreKitProductLoadError {
            return storeKitError.localizedDescription
        }

        return error.localizedDescription
    }
}

private enum StoreKitProductLoadError: LocalizedError {
    case timeout

    var errorDescription: String? {
        switch self {
        case .timeout:
            return "Timed out waiting for App Store products."
        }
    }
}
