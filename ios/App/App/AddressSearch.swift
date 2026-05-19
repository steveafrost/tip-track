import Combine
import MapKit

final class AddressSearch: NSObject, ObservableObject, MKLocalSearchCompleterDelegate {
    @Published private(set) var suggestions: [AddressSuggestion] = []

    private let completer = MKLocalSearchCompleter()
    private var lookupTasks: [Task<Void, Never>] = []

    override init() {
        super.init()
        completer.delegate = self
        completer.resultTypes = .address
    }

    func update(query: String) {
        guard query.trimmingCharacters(in: .whitespacesAndNewlines).count >= 2 else {
            clear()
            return
        }
        completer.queryFragment = query
    }

    func clear() {
        lookupTasks.forEach { $0.cancel() }
        lookupTasks = []
        suggestions = []
        completer.queryFragment = ""
    }

    func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
        lookupTasks.forEach { $0.cancel() }
        suggestions = completer.results.prefix(5).map {
            AddressSuggestion(
                id: $0.title + $0.subtitle,
                title: $0.title,
                subtitle: $0.subtitle,
                latitude: 0,
                longitude: 0
            )
        }

        lookupTasks = completer.results.prefix(5).map { result in
            Task { [weak self] in
                let request = MKLocalSearch.Request(completion: result)
                let response = try? await MKLocalSearch(request: request).start()
                guard let coordinate = response?.mapItems.first?.placemark.coordinate else { return }
                guard let self else { return }
                await MainActor.run {
                    self.updateCoordinate(for: result.title + result.subtitle, coordinate: coordinate)
                }
            }
        }
    }

    func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
        suggestions = []
    }

    private func updateCoordinate(for id: String, coordinate: CLLocationCoordinate2D) {
        guard let index = suggestions.firstIndex(where: { $0.id == id }) else { return }
        suggestions[index].latitude = coordinate.latitude
        suggestions[index].longitude = coordinate.longitude
    }
}

struct AddressSuggestion: Identifiable, Equatable {
    let id: String
    let title: String
    let subtitle: String
    var latitude: Double
    var longitude: Double
}
