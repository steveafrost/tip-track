import Foundation

struct TipTrackOrderDraft: Equatable {
    var address: String?
    var latitude: Double
    var longitude: Double
    var externalId: String?
    var tip: TipCategory?
}

enum TipTrackIntentDestination: Equatable {
    case tab(AppTab)
    case addOrder(TipTrackOrderDraft)
    case order(id: String)
    case location(address: String)
}

struct TipTrackIntentRoute: Equatable, Identifiable {
    let id = UUID()
    let destination: TipTrackIntentDestination

    static func == (lhs: TipTrackIntentRoute, rhs: TipTrackIntentRoute) -> Bool {
        lhs.id == rhs.id
    }
}

@MainActor
final class TipTrackIntentRouter: ObservableObject {
    static let shared = TipTrackIntentRouter()

    @Published var route: TipTrackIntentRoute?

    private init() {}

    func route(to destination: TipTrackIntentDestination) {
        route = TipTrackIntentRoute(destination: destination)
    }
}
