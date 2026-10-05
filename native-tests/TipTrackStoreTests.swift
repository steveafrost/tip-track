import Foundation
import XCTest
@testable import TipTrackCore

private actor RequestGate {
    private var continuation: CheckedContinuation<(Int, Data), Error>?
    private var result: Result<(Int, Data), Error>?
    var started = false
    func response() async throws -> (Int, Data) {
        started = true
        if let result { return try result.get() }
        return try await withCheckedThrowingContinuation { continuation = $0 }
    }
    func complete(_ result: Result<(Int, Data), Error>) {
        self.result = result
        continuation?.resume(with: result)
        continuation = nil
    }
}

private final class MockURLProtocol: URLProtocol {
    static var handler: ((URLRequest) async throws -> (Int, Data))!
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        Task {
            do {
                let (status, data) = try await Self.handler(request)
                let response = HTTPURLResponse(url: request.url!, statusCode: status, httpVersion: nil, headerFields: nil)!
                client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
                client?.urlProtocol(self, didLoad: data)
                client?.urlProtocolDidFinishLoading(self)
            } catch { client?.urlProtocol(self, didFailWithError: error) }
        }
    }
    override func stopLoading() {}
}

@MainActor
final class TipTrackStoreTests: XCTestCase {
    private var suiteName = ""
    private var defaults: UserDefaults!
    private var gate: RequestGate!
    private var client: TipTrackAPIClient!

    override func setUp() async throws {
        suiteName = "TipTrackTests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)!
        gate = RequestGate()
        let requestGate = gate!
        MockURLProtocol.handler = { request in
            XCTAssertEqual(request.url?.host, "tiptrack.invalid")
            return try await requestGate.response()
        }
        let configuration = URLSessionConfiguration.ephemeral
        configuration.protocolClasses = [MockURLProtocol.self]
        client = TipTrackAPIClient(
            configuration: TipTrackAPIConfiguration(baseURL: URL(string: "https://tiptrack.invalid")!, token: ""),
            session: URLSession(configuration: configuration)
        )
    }

    override func tearDown() async throws {
        defaults.removePersistentDomain(forName: suiteName)
        MockURLProtocol.handler = nil
    }

    private func order(_ id: String, user: String, tip: Int = 1) -> TipOrder {
        TipOrder(id: id, externalId: id, address: "Test Address", latitude: 1, longitude: 2,
                 tip: tip, createdBy: user, createdAt: Date(timeIntervalSince1970: 100), updatedAt: Date(timeIntervalSince1970: 100))
    }
    private func seed(user: String = "A", token: String = "token-A", orders: [TipOrder]) throws {
        let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601
        defaults.set(try encoder.encode(DriverSession(userId: user, displayName: user, sessionToken: token, authProvider: "apple", connectedProviders: ["apple"])), forKey: "tip-track.session")
        defaults.set(try encoder.encode(orders), forKey: "tip-track.orders")
    }
    private func complete(orders: [TipOrder]) async throws {
        struct Response: Encodable { let orders: [TipOrder] }
        let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601
        await gate.complete(.success((200, try encoder.encode(Response(orders: orders)))))
    }
    private func waitStarted() async {
        for _ in 0..<10000 {
            if await gate.started { return }
            await Task.yield()
        }
        XCTFail("Mock request never started")
    }
    private func cached() throws -> [TipOrder] {
        let decoder = JSONDecoder(); decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode([TipOrder].self, from: defaults.data(forKey: "tip-track.orders")!)
    }

    func testRefreshPreservesOtherAccountsAndRejectsForeignResponseOrders() async throws {
        try seed(orders: [order("old-A", user: "A"), order("offline-B", user: "B")])
        let store = TipTrackStore(defaults: defaults, apiClient: client)
        let task = Task { try await store.refreshOrders() }; await waitStarted()
        try await complete(orders: [order("new-A", user: "A"), order("foreign", user: "B")])
        try await task.value
        XCTAssertEqual(store.orders.map(\.id), ["new-A"])
        XCTAssertEqual(Set(try cached().map(\.id)), ["new-A", "offline-B"])
    }
    func testSignOutDiscardsInFlightResponse() async throws {
        try seed(orders: [order("cached-A", user: "A")])
        let store = TipTrackStore(defaults: defaults, apiClient: client)
        let task = Task { try await store.refreshOrders() }; await waitStarted()
        store.signOut()
        try await complete(orders: [order("new-A", user: "A")]); try await task.value
        XCTAssertTrue(store.orders.isEmpty)
        XCTAssertEqual(try cached().map(\.id), ["cached-A"])
    }
    func testAccountSwitchDiscardsInFlightResponse() async throws {
        try seed(orders: [order("cached-A", user: "A")])
        let store = TipTrackStore(defaults: defaults, apiClient: client)
        let task = Task { try await store.refreshOrders() }; await waitStarted()
        store.startDemoSession()
        try await complete(orders: [order("new-A", user: "A")]); try await task.value
        XCTAssertTrue(store.orders.allSatisfy { $0.createdBy == "app-store-demo" })
        XCTAssertTrue(try cached().contains { $0.id == "cached-A" })
    }
    func testStaleFailureAfterSignOutIsIgnored() async throws {
        try seed(orders: [])
        let store = TipTrackStore(defaults: defaults, apiClient: client)
        let task = Task { try await store.refreshOrders() }; await waitStarted(); store.signOut()
        await gate.complete(.failure(URLError(.notConnectedToInternet)))
        try await task.value
    }
    func testCurrentFailureLeavesCacheAndThrows() async throws {
        try seed(orders: [order("cached-A", user: "A")])
        let store = TipTrackStore(defaults: defaults, apiClient: client)
        let task = Task { try await store.refreshOrders() }; await waitStarted()
        await gate.complete(.failure(URLError(.notConnectedToInternet)))
        do { try await task.value; XCTFail("Expected network failure") } catch {}
        XCTAssertEqual(store.orders.map(\.id), ["cached-A"])
    }
    func testEditsDuringRefreshWinOverStaleResponse() async throws {
        try seed(orders: [order("edited", user: "A")])
        let store = TipTrackStore(defaults: defaults, apiClient: client)
        let task = Task { try await store.refreshOrders() }; await waitStarted()
        // Finish the foreground edit before the old GET.
        let requestGate = gate!
        MockURLProtocol.handler = { request in
            if request.httpMethod == "PATCH" {
                struct Response: Encodable { let order: TipOrder }
                let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601
                return (200, try encoder.encode(Response(order: self.order("edited", user: "A", tip: 4))))
            }
            return try await requestGate.response()
        }
        try await store.updateOrder(id: "edited", address: "Test Address", latitude: 1, longitude: 2, tip: 4)
        try await complete(orders: [order("edited", user: "A", tip: 1)]); try await task.value
        XCTAssertEqual(store.orders.first?.tip, 4)
    }
    func testOrderAddedDuringRefreshIsRetained() async throws {
        try seed(orders: [])
        let store = TipTrackStore(defaults: defaults, apiClient: client)
        let oldTask = Task { try await store.refreshOrders() }; await waitStarted()
        MockURLProtocol.handler = { request in
            XCTAssertEqual(request.httpMethod, "POST")
            struct Response: Encodable { let order: TipOrder }
            let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601
            return (200, try encoder.encode(Response(order: self.order("just-added", user: "A"))))
        }
        try await store.addOrder(address: "Test Address", latitude: 1, longitude: 2, externalId: "just-added", tip: 1)
        try await complete(orders: []); try await oldTask.value
        XCTAssertEqual(store.orders.map(\.id), ["just-added"])
    }
    func testSameUserNewTokenDiscardsOldResponse() async throws {
        try seed(orders: [order("cached-A", user: "A")])
        let store = TipTrackStore(defaults: defaults, apiClient: client)
        let oldTask = Task { try await store.refreshOrders() }; await waitStarted()
        MockURLProtocol.handler = { request in
            if request.url!.path.hasSuffix("/session") {
                return (200, Data(#"{"driverId":"A","displayName":"A","sessionToken":"new-token"}"#.utf8))
            }
            XCTAssertEqual(request.value(forHTTPHeaderField: "x-tip-track-session-token"), "new-token")
            struct Response: Encodable { let orders: [TipOrder] }
            let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601
            return (200, try encoder.encode(Response(orders: [self.order("new-session", user: "A")])))
        }
        try await store.signInWithApple(identityToken: "mock", rawNonce: "mock", displayName: "A")
        try await complete(orders: [order("stale-session", user: "A")]); try await oldTask.value
        XCTAssertEqual(store.orders.map(\.id), ["new-session"])
    }
    func testNewerRefreshWinsWhenOldResponseArrivesLast() async throws {
        try seed(orders: [])
        let store = TipTrackStore(defaults: defaults, apiClient: client)
        let oldTask = Task { try await store.refreshOrders() }; await waitStarted()
        MockURLProtocol.handler = { _ in
            struct Response: Encodable { let orders: [TipOrder] }
            let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601
            return (200, try encoder.encode(Response(orders: [self.order("newest", user: "A")])))
        }
        try await store.refreshOrders()
        try await complete(orders: [order("older", user: "A")]); try await oldTask.value
        XCTAssertEqual(store.orders.map(\.id), ["newest"])
    }
    func testPersistenceUsesInjectedSuiteOnly() async throws {
        let standardBefore = UserDefaults.standard.data(forKey: "tip-track.session")
        try seed(orders: [])
        let store = TipTrackStore(defaults: defaults, apiClient: nil)
        store.signOut()
        XCTAssertNil(TipTrackStore(defaults: defaults, apiClient: nil).session.userId)
        XCTAssertEqual(UserDefaults.standard.data(forKey: "tip-track.session"), standardBefore)
        store.startDemoSession()
        try await store.addOrder(address: "Local Address", latitude: 1, longitude: 2, externalId: "Local", tip: 3)
        XCTAssertTrue(TipTrackStore(defaults: defaults, apiClient: nil).orders.contains { $0.externalId == "Local" })
    }
    func testIndependentShortcutEditSurvivesForegroundRefresh() async throws {
        try seed(orders: [order("edited", user: "A")])
        let foreground = TipTrackStore(defaults: defaults, apiClient: client)
        let task = Task { try await foreground.refreshOrders() }; await waitStarted()
        MockURLProtocol.handler = { request in
            XCTAssertEqual(request.httpMethod, "PATCH")
            struct Response: Encodable { let order: TipOrder }
            let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601
            return (200, try encoder.encode(Response(order: self.order("edited", user: "A", tip: 4))))
        }
        let shortcut = TipTrackStore(defaults: defaults, apiClient: client)
        try await shortcut.updateOrder(id: "edited", address: "Test Address", latitude: 1, longitude: 2, tip: 4)
        try await complete(orders: [order("edited", user: "A")]); try await task.value
        XCTAssertEqual(foreground.orders.first?.tip, 4)
        XCTAssertEqual(try cached().first?.tip, 4)
    }

    func testIndependentCacheAdditionRemovalAndOtherAccountEditSurviveRefresh() async throws {
        try seed(orders: [order("removed", user: "A"), order("offline", user: "B")])
        let foreground = TipTrackStore(defaults: defaults, apiClient: client)
        let task = Task { try await foreground.refreshOrders() }; await waitStarted()
        // No delete endpoint exists in the app; model a completed independent cache removal.
        let encoder = JSONEncoder(); encoder.dateEncodingStrategy = .iso8601
        defaults.set(try encoder.encode([order("added", user: "A"), order("offline", user: "B", tip: 4)]),
                     forKey: "tip-track.orders")
        try await complete(orders: [order("removed", user: "A")]); try await task.value
        XCTAssertEqual(foreground.orders.map(\.id), ["added"])
        XCTAssertEqual(try cached().first { $0.id == "offline" }?.tip, 4)
        XCTAssertFalse(try cached().contains { $0.id == "removed" })
    }

    func testIndependentSessionChangesDiscardOldSuccessAndFailure() async throws {
        for replacement in ["signout", "B", "new-token"] {
            for failure in [false, true] {
                gate = RequestGate()
                let requestGate = gate!
                MockURLProtocol.handler = { _ in try await requestGate.response() }
                try seed(orders: [order("cached", user: "A")])
                let foreground = TipTrackStore(defaults: defaults, apiClient: client)
                let task = Task { try await foreground.refreshOrders() }; await waitStarted()
                if replacement == "signout" {
                    TipTrackStore(defaults: defaults, apiClient: nil).signOut()
                } else {
                    try seed(user: replacement == "B" ? "B" : "A", token: replacement,
                             orders: [order("cached", user: "A")])
                }
                if failure { await gate.complete(.failure(URLError(.notConnectedToInternet))) }
                else { try await complete(orders: [order("stale", user: "A")]) }
                try await task.value
                XCTAssertEqual(try cached().map(\.id), ["cached"])
                XCTAssertEqual(TipTrackStore(defaults: defaults, apiClient: nil).session.userId,
                               replacement == "signout" ? nil : replacement == "B" ? "B" : "A")
            }
        }
    }

}
