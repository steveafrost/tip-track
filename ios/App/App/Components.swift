import SwiftUI

struct AddressLookupField: View {
    let title: String
    @Binding var address: String
    @Binding var latitude: Double
    @Binding var longitude: Double
    @ObservedObject var search: AddressSearch

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
            TextField("Enter an address", text: $address)
                .textInputAutocapitalization(.words)
                .textFieldStyle(.roundedBorder)
                .onChange(of: address) { newValue in
                    search.update(query: newValue)
                }

            if !search.suggestions.isEmpty {
                VStack(spacing: 0) {
                    ForEach(search.suggestions.prefix(5)) { suggestion in
                        Button {
                            address = suggestion.title
                            latitude = suggestion.latitude
                            longitude = suggestion.longitude
                            search.clear()
                        } label: {
                            VStack(alignment: .leading, spacing: 3) {
                                Text(suggestion.title)
                                    .font(.subheadline.weight(.semibold))
                                if !suggestion.subtitle.isEmpty {
                                    Text(suggestion.subtitle)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.vertical, 10)
                        }
                        Divider()
                    }
                }
                .padding(.horizontal, 12)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
    }
}

struct OrderCard: View {
    let order: TipOrder
    let onEdit: () -> Void

    var body: some View {
        Button(action: onEdit) {
            VStack(alignment: .leading, spacing: 18) {
                HStack {
                    Text("Order #\(order.externalId)")
                        .font(.headline)
                    Spacer()
                    Image(systemName: "pencil.circle.fill")
                        .foregroundColor(.tipGreen)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Location: \(order.address)")
                    Text("Tip: \(TipCategory(rawValue: order.tip ?? -1)?.label ?? "No Tip Recorded")")
                }

                Text("Tap the card to edit order details.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .appCard()
        .buttonStyle(.plain)
    }
}

struct LocationCard: View {
    let location: TipLocation
    @Binding var editingOrder: TipOrder?

    private var averageTip: TipCategory {
        location.averageTip
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Average: \(averageTip.label)")
                    .font(.headline)
                Spacer()
                Image(systemName: averageTip.symbolName)
                    .foregroundColor(.tipGreen)
            }

            Text("Previous Tips")
                .font(.subheadline.weight(.semibold))

            VStack(alignment: .leading, spacing: 10) {
                ForEach(location.orders) { order in
                    Button {
                        editingOrder = order
                    } label: {
                        HStack(spacing: 8) {
                            Text(TipCategory(rawValue: order.tip ?? -1)?.label ?? "No Tip Recorded")
                            Text("(\(order.createdAt.formatted(.dateTime.month(.twoDigits).day(.twoDigits).year(.twoDigits))))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Spacer()
                            Image(systemName: "pencil")
                                .foregroundColor(.secondary)
                        }
                    }
                    .buttonStyle(.plain)
                    Divider()
                }
            }
        }
        .appCard()
    }
}


struct SearchField: View {
    let placeholder: String
    @Binding var text: String

    init(_ placeholder: String, text: Binding<String>) {
        self.placeholder = placeholder
        _text = text
    }

    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
            TextField(placeholder, text: $text)
                .textInputAutocapitalization(.never)
        }
        .padding(12)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct ResultsList<Item: Identifiable, Row: View>: View {
    let items: [Item]
    let emptyText: String
    let row: (Item) -> Row

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if items.isEmpty {
                Text(emptyText)
                    .foregroundColor(.secondary)
                    .padding()
            } else {
                ForEach(items) { item in
                    row(item)
                        .buttonStyle(.plain)
                        .padding()
                    Divider()
                }
            }
        }
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct EmptyPrompt: View {
    let message: String

    init(_ message: String) {
        self.message = message
    }

    var body: some View {
        Text(message)
            .font(.headline)
            .foregroundColor(.white)
            .padding(.horizontal, 4)
    }
}

struct AppBackground: View {
    var body: some View {
        LinearGradient(
            colors: [.tipGreen, Color(red: 0.11, green: 0.36, blue: 0.2)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}


extension View {
    func appCard() -> some View {
        self
            .padding(18)
            .background(Color.zinc800.opacity(0.78))
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.black.opacity(0.25), lineWidth: 2)
            )
            .shadow(color: .black.opacity(0.18), radius: 12, y: 6)
    }

    func appNavigationTitle(_ title: String) -> some View {
        self
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.large)
    }
}

extension Color {
    static let tipGreen = Color(red: 0, green: 0.42, blue: 0.13)
    static let zinc800 = Color(red: 0.15, green: 0.15, blue: 0.16)
    static let zinc900 = Color(red: 0.09, green: 0.09, blue: 0.10)
}
