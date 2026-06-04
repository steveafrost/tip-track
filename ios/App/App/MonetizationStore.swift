import Foundation
import StoreKit

@MainActor
final class MonetizationStore: ObservableObject {
    static let unlockProductID = "com.steveafrost.tiptrack.pro.unlock"
    static let freeOrderLimit = 20
    private static let productLoadTimeoutNanoseconds: UInt64 = 12_000_000_000

    @Published private(set) var products: [Product] = []
    @Published private(set) var purchasedProductIDs: Set<String> = []
    @Published var errorMessage: String?
    @Published var isLoading = false

    private var updatesTask: Task<Void, Never>?

    var isPro: Bool {
        !purchasedProductIDs.isDisjoint(with: Self.productIDs)
    }

    var sortedProducts: [Product] {
        products.sorted { left, right in
            productRank(left.id) < productRank(right.id)
        }
    }

    private static var productIDs: Set<String> {
        [unlockProductID]
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
        await refreshProducts()
        await refreshEntitlements()
    }

    func refreshProducts() async {
        guard products.isEmpty else { return }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let loadedProducts = try await Self.loadProductsWithTimeout()
            products = loadedProducts

            if loadedProducts.isEmpty {
                errorMessage = "TipTrack Pro is not available from the App Store yet. Please try again in a moment."
            }
        } catch {
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
        default:
            return 1
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
}

private enum StoreKitProductLoadError: Error {
    case timeout
}
