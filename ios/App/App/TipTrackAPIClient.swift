import Foundation

struct TipTrackAPIConfiguration {
    let baseURL: URL
    let token: String

    static var bundled: TipTrackAPIConfiguration? {
        guard
            let rawBaseURL = Bundle.main.object(forInfoDictionaryKey: "TipTrackAPIBaseURL") as? String,
            let baseURL = URL(string: rawBaseURL.trimmingCharacters(in: .whitespacesAndNewlines)),
            !rawBaseURL.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        else {
            return nil
        }

        let token = (Bundle.main.object(forInfoDictionaryKey: "TipTrackAPIToken") as? String) ?? ""

        return TipTrackAPIConfiguration(baseURL: baseURL, token: token)
    }
}

struct TipTrackAPIClient {
    private let configuration: TipTrackAPIConfiguration
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    init(configuration: TipTrackAPIConfiguration, session: URLSession = .shared) {
        self.configuration = configuration
        self.session = session
        self.decoder = TipTrackAPIClient.makeDecoder()
        self.encoder = JSONEncoder()
    }

    func signInWithApple(identityToken: String, rawNonce: String, displayName: String?) async throws -> DriverSession {
        let requestBody = MobileSessionRequest(
            identityToken: identityToken,
            rawNonce: rawNonce,
            displayName: displayName
        )
        let response: MobileSessionResponse = try await send(
            path: "/api/mobile/session",
            method: "POST",
            body: requestBody,
            session: nil
        )

        return DriverSession(
            userId: response.driverId,
            displayName: response.displayName,
            sessionToken: response.sessionToken
        )
    }

    func fetchOrders(session driverSession: DriverSession) async throws -> [TipOrder] {
        let response: MobileOrdersResponse = try await send(
            path: "/api/mobile/orders",
            method: "GET",
            body: Optional<String>.none,
            session: driverSession
        )

        return response.orders
    }

    func addOrder(
        session driverSession: DriverSession,
        address: String,
        latitude: Double,
        longitude: Double,
        externalId: String
    ) async throws -> TipOrder {
        let requestBody = MobileOrderCreateRequest(
            externalId: externalId,
            location: MobileLocationRequest(
                address: address,
                latitude: latitude,
                longitude: longitude
            )
        )

        let response: MobileOrderResponse = try await send(
            path: "/api/mobile/orders",
            method: "POST",
            body: requestBody,
            session: driverSession
        )

        return response.order
    }

    func updateOrder(
        session driverSession: DriverSession,
        order: TipOrder,
        address: String,
        latitude: Double,
        longitude: Double,
        tip: Int
    ) async throws -> TipOrder {
        let requestBody = MobileOrderUpdateRequest(
            tip: tip,
            location: MobileLocationRequest(
                address: address,
                latitude: latitude,
                longitude: longitude
            )
        )

        let response: MobileOrderResponse = try await send(
            path: "/api/mobile/orders/\(order.externalId.urlPathEncoded)",
            method: "PATCH",
            body: requestBody,
            session: driverSession
        )

        return response.order
    }

    func fetchAppleEntitlement(session driverSession: DriverSession) async throws -> StoreKitEntitlement {
        let response: MobileEntitlementResponse = try await send(
            path: "/api/mobile/entitlements/apple",
            method: "GET",
            body: Optional<String>.none,
            session: driverSession
        )

        return response.entitlement
    }

    func syncAppleEntitlement(
        session driverSession: DriverSession,
        signedTransactionInfo: String
    ) async throws -> StoreKitEntitlement {
        let requestBody = MobileAppleEntitlementRequest(
            signedTransactionInfo: signedTransactionInfo
        )

        let response: MobileEntitlementResponse = try await send(
            path: "/api/mobile/entitlements/apple",
            method: "POST",
            body: requestBody,
            session: driverSession
        )

        return response.entitlement
    }

    private func send<Response: Decodable, Body: Encodable>(
        path: String,
        method: String,
        body: Body?,
        session driverSession: DriverSession?
    ) async throws -> Response {
        let url = configuration.baseURL.appendingPathComponent(path)
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if !configuration.token.isEmpty {
            request.setValue("Bearer \(configuration.token)", forHTTPHeaderField: "Authorization")
        }

        if let sessionToken = driverSession?.sessionToken {
            request.setValue(sessionToken, forHTTPHeaderField: "x-tip-track-session-token")
        } else if let driverId = driverSession?.userId {
            request.setValue(driverId, forHTTPHeaderField: "x-tip-track-driver-id")
        }

        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try encoder.encode(body)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw TipTrackAPIError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            if let errorResponse = try? decoder.decode(MobileErrorResponse.self, from: data) {
                throw TipTrackAPIError.server(errorResponse.error)
            }

            throw TipTrackAPIError.server("Request failed with status \(httpResponse.statusCode)")
        }

        return try decoder.decode(Response.self, from: data)
    }

    private static func makeDecoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let value = try container.decode(String.self)
            let fractionalFormatter = ISO8601DateFormatter()
            fractionalFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

            if let date = fractionalFormatter.date(from: value) {
                return date
            }

            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime]

            if let date = formatter.date(from: value) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Invalid ISO-8601 date: \(value)"
            )
        }

        return decoder
    }
}

enum TipTrackAPIError: LocalizedError {
    case invalidResponse
    case server(String)

    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "The server returned an invalid response."
        case .server(let message):
            return message
        }
    }
}

private struct MobileSessionRequest: Encodable {
    let identityToken: String
    let rawNonce: String
    let displayName: String?
}

private struct MobileSessionResponse: Decodable {
    let driverId: String
    let displayName: String
    let sessionToken: String
}

private struct MobileOrdersResponse: Decodable {
    let orders: [TipOrder]
}

private struct MobileOrderResponse: Decodable {
    let order: TipOrder
}

private struct MobileErrorResponse: Decodable {
    let error: String
}

struct StoreKitEntitlement: Decodable {
    let isPro: Bool
    let productId: String
    let environment: String?
    let purchasedAt: String?
    let revokedAt: String?
}

private struct MobileEntitlementResponse: Decodable {
    let entitlement: StoreKitEntitlement
}

private struct MobileLocationRequest: Encodable {
    let address: String
    let latitude: Double
    let longitude: Double
}

private struct MobileOrderCreateRequest: Encodable {
    let externalId: String
    let location: MobileLocationRequest
}

private struct MobileOrderUpdateRequest: Encodable {
    let tip: Int
    let location: MobileLocationRequest
}

private struct MobileAppleEntitlementRequest: Encodable {
    let signedTransactionInfo: String
}

private extension String {
    var urlPathEncoded: String {
        addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? self
    }
}
