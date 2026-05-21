import Foundation

enum AppTab {
    case submit
    case orders
    case locations
    case reports
}

enum TipCategory: Int, CaseIterable, Identifiable, Codable {
    case none = 0
    case underFive = 1
    case fiveToTen = 2
    case overTen = 3
    case overTwenty = 4

    var id: Int { rawValue }

    var label: String {
        switch self {
        case .none:
            return "No Tip"
        case .underFive:
            return "Less Than $5"
        case .fiveToTen:
            return "Between $5 and $10"
        case .overTen:
            return "More Than $10"
        case .overTwenty:
            return "More Than $20"
        }
    }

    var symbolName: String {
        switch self {
        case .none:
            return "heart.slash.fill"
        case .underFive:
            return "heart.fill"
        case .fiveToTen:
            return "dollarsign.circle.fill"
        case .overTen:
            return "banknote.fill"
        case .overTwenty:
            return "crown.fill"
        }
    }
}

struct TipBucket: Identifiable {
    let category: TipCategory
    let count: Int

    var id: Int { category.rawValue }
}

struct TipOrder: Identifiable, Codable, Equatable {
    let id: String
    var externalId: String
    var address: String
    var latitude: Double
    var longitude: Double
    var tip: Int?
    var createdBy: String
    let createdAt: Date
    var updatedAt: Date
}

struct TipLocation: Identifiable, Equatable {
    let address: String
    let latitude: Double
    let longitude: Double
    let orders: [TipOrder]

    var id: String { address }

    var averageTip: TipCategory {
        guard !orders.isEmpty else { return .none }
        let total = orders.reduce(0) { $0 + ($1.tip ?? 0) }
        let average = Int(ceil(Double(total) / Double(orders.count)))
        return TipCategory(rawValue: average) ?? .none
    }
}

struct DriverSession: Codable {
    var userId: String?
    var displayName: String?
    var sessionToken: String?

    var isSignedIn: Bool {
        userId != nil
    }
}
