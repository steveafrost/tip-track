import AppIntents
import Foundation
import StoreKit

@available(iOS 16.0, *)
enum TipTrackSectionIntentValue: String, AppEnum {
    case addOrder
    case orders
    case locations
    case reports

    static var typeDisplayName: LocalizedStringResource { "Section" }
    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Section")

    static var caseDisplayRepresentations: [TipTrackSectionIntentValue: DisplayRepresentation] {
        [
            .addOrder: DisplayRepresentation(title: "Add Order", image: .init(systemName: "shippingbox")),
            .orders: DisplayRepresentation(title: "Orders", image: .init(systemName: "magnifyingglass")),
            .locations: DisplayRepresentation(title: "Locations", image: .init(systemName: "building.2")),
            .reports: DisplayRepresentation(title: "Reports", image: .init(systemName: "chart.pie"))
        ]
    }

    var appTab: AppTab {
        switch self {
        case .addOrder:
            return .submit
        case .orders:
            return .orders
        case .locations:
            return .locations
        case .reports:
            return .reports
        }
    }
}

@available(iOS 16.0, *)
enum TipTrackTipIntentValue: String, AppEnum {
    case noTip
    case underFive
    case fiveToTen
    case overTen
    case overTwenty

    static var typeDisplayName: LocalizedStringResource { "Tip Range" }
    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Tip Range")

    static var caseDisplayRepresentations: [TipTrackTipIntentValue: DisplayRepresentation] {
        [
            .noTip: DisplayRepresentation(title: "No Tip", image: .init(systemName: "heart.slash.fill")),
            .underFive: DisplayRepresentation(title: "Less Than 5 Dollars", image: .init(systemName: "heart.fill")),
            .fiveToTen: DisplayRepresentation(title: "5 to 10 Dollars", image: .init(systemName: "dollarsign.circle.fill")),
            .overTen: DisplayRepresentation(title: "More Than 10 Dollars", image: .init(systemName: "banknote.fill")),
            .overTwenty: DisplayRepresentation(title: "More Than 20 Dollars", image: .init(systemName: "crown.fill"))
        ]
    }

    var category: TipCategory {
        switch self {
        case .noTip:
            return .none
        case .underFive:
            return .underFive
        case .fiveToTen:
            return .fiveToTen
        case .overTen:
            return .overTen
        case .overTwenty:
            return .overTwenty
        }
    }
}

@available(iOS 16.0, *)
struct TipTrackOrderEntity: AppEntity {
    typealias ID = String

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Delivery Order")
    static let defaultQuery = TipTrackOrderQuery()

    let id: String
    let orderNumber: String
    let address: String
    let tipLabel: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "Order #\(orderNumber)",
            subtitle: "\(address) - \(tipLabel)",
            image: .init(systemName: "receipt")
        )
    }
}

@available(iOS 16.0, *)
struct TipTrackOrderQuery: EntityQuery, EntityStringQuery {
    func entities(for identifiers: [TipTrackOrderEntity.ID]) async throws -> [TipTrackOrderEntity] {
        let orders = await TipTrackIntentDataSource.orders()
        return orders
            .filter { identifiers.contains($0.id) }
            .map(TipTrackOrderEntity.init(order:))
    }

    func entities(matching string: String) async throws -> [TipTrackOrderEntity] {
        let orders = await TipTrackIntentDataSource.orders()
        let query = string.trimmingCharacters(in: .whitespacesAndNewlines)

        return orders
            .filter { order in
                query.isEmpty ||
                    order.externalId.localizedCaseInsensitiveContains(query) ||
                    order.address.localizedCaseInsensitiveContains(query)
            }
            .prefix(10)
            .map(TipTrackOrderEntity.init(order:))
    }

    func suggestedEntities() async throws -> [TipTrackOrderEntity] {
        let orders = await TipTrackIntentDataSource.orders()
        return orders.prefix(10).map(TipTrackOrderEntity.init(order:))
    }
}

@available(iOS 16.0, *)
struct TipTrackLocationEntity: AppEntity {
    typealias ID = String

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Delivery Location")
    static let defaultQuery = TipTrackLocationQuery()

    let id: String
    let address: String
    let orderCount: Int
    let averageTipLabel: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(address)",
            subtitle: "\(orderCount) saved order\(orderCount == 1 ? "" : "s") - \(averageTipLabel)",
            image: .init(systemName: "building.2")
        )
    }
}

@available(iOS 16.0, *)
struct TipTrackLocationQuery: EntityQuery, EntityStringQuery {
    func entities(for identifiers: [TipTrackLocationEntity.ID]) async throws -> [TipTrackLocationEntity] {
        let locations = await TipTrackIntentDataSource.locations()
        return locations
            .filter { identifiers.contains($0.id) }
            .map(TipTrackLocationEntity.init(location:))
    }

    func entities(matching string: String) async throws -> [TipTrackLocationEntity] {
        let locations = await TipTrackIntentDataSource.locations()
        let query = string.trimmingCharacters(in: .whitespacesAndNewlines)

        return locations
            .filter { location in
                query.isEmpty ||
                    location.address.localizedCaseInsensitiveContains(query) ||
                    location.orders.contains { $0.externalId.localizedCaseInsensitiveContains(query) }
            }
            .prefix(10)
            .map(TipTrackLocationEntity.init(location:))
    }

    func suggestedEntities() async throws -> [TipTrackLocationEntity] {
        let locations = await TipTrackIntentDataSource.locations()
        return locations.prefix(10).map(TipTrackLocationEntity.init(location:))
    }
}

@available(iOS 16.0, *)
struct LogDeliveryOrderIntent: AppIntent {
    static let title: LocalizedStringResource = "Log Delivery Order"
    static let description = IntentDescription("Save a delivery order, address, and optional tip range without opening Tip Track.")
    static let openAppWhenRun = false

    @Parameter(title: "Order ID")
    var orderID: String

    @Parameter(title: "Address")
    var address: String

    @Parameter(title: "Tip Range")
    var tipRange: TipTrackTipIntentValue?

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let store = TipTrackStore()
        let trimmedOrderID = orderID.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedAddress = address.trimmingCharacters(in: .whitespacesAndNewlines)

        guard store.session.isSignedIn else {
            return .result(dialog: "Sign in to Tip Track before logging orders from Shortcuts or Siri.")
        }
        guard trimmedOrderID.count >= 2 else {
            return .result(dialog: "Order ID must contain at least 2 characters.")
        }
        guard trimmedAddress.count >= 2 else {
            return .result(dialog: "Address must contain at least 2 characters.")
        }
        guard !store.hasOrder(externalId: trimmedOrderID) else {
            return .result(dialog: "Order #\(trimmedOrderID) is already saved.")
        }

        let isPro = await TipTrackIntentEntitlements.isProUnlocked()
        guard isPro || store.orders.count < MonetizationStore.freeOrderLimit else {
            return .result(dialog: "Upgrade to TipTrack Pro before adding more than \(MonetizationStore.freeOrderLimit) orders.")
        }

        do {
            try await store.addOrder(
                address: trimmedAddress,
                latitude: 0,
                longitude: 0,
                externalId: trimmedOrderID,
                tip: tipRange?.category.rawValue
            )
            return .result(dialog: "Logged order #\(trimmedOrderID).")
        } catch {
            return .result(dialog: "Could not log order #\(trimmedOrderID). Please try again in Tip Track.")
        }
    }
}

@available(iOS 16.0, *)
struct UpdateOrderTipIntent: AppIntent {
    static let title: LocalizedStringResource = "Update Order Tip"
    static let description = IntentDescription("Update the tip range for a saved delivery order.")
    static let openAppWhenRun = false

    @Parameter(title: "Order")
    var order: TipTrackOrderEntity

    @Parameter(title: "Tip Range")
    var tipRange: TipTrackTipIntentValue

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let store = TipTrackStore()

        guard let savedOrder = store.orders.first(where: { $0.id == order.id }) else {
            return .result(dialog: "That order is not available in Tip Track.")
        }

        do {
            try await store.updateOrder(
                id: savedOrder.id,
                address: savedOrder.address,
                latitude: savedOrder.latitude,
                longitude: savedOrder.longitude,
                tip: tipRange.category.rawValue
            )
            return .result(dialog: "Updated order #\(savedOrder.externalId) to \(tipRange.category.label).")
        } catch {
            return .result(dialog: "Could not update order #\(savedOrder.externalId). Please try again in Tip Track.")
        }
    }
}

@available(iOS 16.0, *)
struct OpenTipTrackSectionIntent: AppIntent {
    static let title: LocalizedStringResource = "Open Tip Track Section"
    static let description = IntentDescription("Open Tip Track to a specific section.")
    static let openAppWhenRun = true

    @Parameter(title: "Section")
    var section: TipTrackSectionIntentValue

    @MainActor
    func perform() async throws -> some IntentResult {
        TipTrackIntentRouter.shared.route(to: .tab(section.appTab))
        return .result()
    }
}

@available(iOS 16.0, *)
struct AddDeliveryOrderInAppIntent: AppIntent {
    static let title: LocalizedStringResource = "Add Delivery Order in App"
    static let description = IntentDescription("Open Tip Track to the add order form with optional details filled in.")
    static let openAppWhenRun = true

    @Parameter(title: "Order ID")
    var orderID: String?

    @Parameter(title: "Address")
    var address: String?

    @Parameter(title: "Tip Range")
    var tipRange: TipTrackTipIntentValue?

    @MainActor
    func perform() async throws -> some IntentResult {
        TipTrackIntentRouter.shared.route(
            to: .addOrder(
                TipTrackOrderDraft(
                    address: address?.trimmingCharacters(in: .whitespacesAndNewlines),
                    latitude: 0,
                    longitude: 0,
                    externalId: orderID?.trimmingCharacters(in: .whitespacesAndNewlines),
                    tip: tipRange?.category
                )
            )
        )
        return .result()
    }
}

@available(iOS 16.0, *)
struct OpenDeliveryOrderIntent: AppIntent {
    static let title: LocalizedStringResource = "Open Delivery Order"
    static let description = IntentDescription("Open Tip Track to a saved delivery order.")
    static let openAppWhenRun = true

    @Parameter(title: "Order")
    var order: TipTrackOrderEntity

    @MainActor
    func perform() async throws -> some IntentResult {
        TipTrackIntentRouter.shared.route(to: .order(id: order.id))
        return .result()
    }
}

@available(iOS 16.0, *)
struct OpenDeliveryLocationIntent: AppIntent {
    static let title: LocalizedStringResource = "Open Delivery Location"
    static let description = IntentDescription("Open Tip Track to a saved delivery location.")
    static let openAppWhenRun = true

    @Parameter(title: "Location")
    var location: TipTrackLocationEntity

    @MainActor
    func perform() async throws -> some IntentResult {
        TipTrackIntentRouter.shared.route(to: .location(address: location.address))
        return .result()
    }
}

@available(iOS 16.0, *)
struct TipTrackAppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: LogDeliveryOrderIntent(),
            phrases: [
                "Log order with \(.applicationName)",
                "Save delivery in \(.applicationName)"
            ],
            shortTitle: "Log Order",
            systemImageName: "plus.circle"
        )

        AppShortcut(
            intent: UpdateOrderTipIntent(),
            phrases: [
                "Update order tip in \(.applicationName)",
                "Change tip in \(.applicationName)"
            ],
            shortTitle: "Update Tip",
            systemImageName: "heart.text.square"
        )

        AppShortcut(
            intent: AddDeliveryOrderInAppIntent(),
            phrases: [
                "Add order in \(.applicationName)",
                "New delivery in \(.applicationName)"
            ],
            shortTitle: "Add in App",
            systemImageName: "shippingbox"
        )

        AppShortcut(
            intent: OpenTipTrackSectionIntent(),
            phrases: [
                "Open \(\.$section) in \(.applicationName)",
                "Show \(\.$section) in \(.applicationName)"
            ],
            shortTitle: "Open Section",
            systemImageName: "square.grid.2x2"
        )

        AppShortcut(
            intent: OpenDeliveryOrderIntent(),
            phrases: [
                "Open \(\.$order) in \(.applicationName)",
                "Find \(\.$order) in \(.applicationName)"
            ],
            shortTitle: "Open Order",
            systemImageName: "receipt"
        )

        AppShortcut(
            intent: OpenDeliveryLocationIntent(),
            phrases: [
                "Open \(\.$location) in \(.applicationName)",
                "Find \(\.$location) in \(.applicationName)"
            ],
            shortTitle: "Open Location",
            systemImageName: "building.2"
        )
    }
}

@available(iOS 16.0, *)
private extension TipTrackOrderEntity {
    init(order: TipOrder) {
        id = order.id
        orderNumber = order.externalId
        address = order.address
        tipLabel = TipCategory(rawValue: order.tip ?? -1)?.label ?? "Tip not recorded"
    }
}

@available(iOS 16.0, *)
private extension TipTrackLocationEntity {
    init(location: TipLocation) {
        id = location.id
        address = location.address
        orderCount = location.orders.count
        averageTipLabel = location.averageTip.label
    }
}

private enum TipTrackIntentDataSource {
    @MainActor
    static func orders() -> [TipOrder] {
        TipTrackStore().orders
    }

    @MainActor
    static func locations() -> [TipLocation] {
        TipTrackStore().locations
    }
}

private enum TipTrackIntentEntitlements {
    private static let unlockProductID = "com.steveafrost.tiptrack.pro.unlock.v2"
    private static let legacyUnlockProductID = "com.steveafrost.tiptrack.pro.unlock"

    static func isProUnlocked() async -> Bool {
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            if transaction.productID == unlockProductID ||
                transaction.productID == legacyUnlockProductID {
                return true
            }
        }

        return false
    }
}
