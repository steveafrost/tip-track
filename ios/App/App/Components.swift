import SwiftUI

enum TipTrackTheme {
    static let cardRadius: CGFloat = 8
    static let controlRadius: CGFloat = 8
    static let pagePadding: CGFloat = 16
}

struct AddressLookupField: View {
    let title: String
    @Binding var address: String
    @Binding var latitude: Double
    @Binding var longitude: Double
    @ObservedObject var search: AddressSearch

    var body: some View {
        FieldStack(title) {
            AppTextField(
                placeholder: "Enter an address",
                text: $address,
                systemImage: "mappin.and.ellipse"
            )
            .textInputAutocapitalization(.words)
            .onChange(of: address) { newValue in
                search.update(query: newValue)
            }

            if !search.suggestions.isEmpty {
                VStack(spacing: 0) {
                    ForEach(Array(search.suggestions.prefix(5).enumerated()), id: \.element.id) { index, suggestion in
                        Button {
                            address = suggestion.title
                            latitude = suggestion.latitude
                            longitude = suggestion.longitude
                            search.clear()
                        } label: {
                            VStack(alignment: .leading, spacing: 3) {
                                Text(suggestion.title)
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(.zinc900)
                                if !suggestion.subtitle.isEmpty {
                                    Text(suggestion.subtitle)
                                        .font(.caption)
                                        .foregroundColor(.zinc500)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.vertical, 12)
                        }
                        .buttonStyle(.plain)

                        if index < min(search.suggestions.count, 5) - 1 {
                            Divider()
                        }
                    }
                }
                .padding(.horizontal, 14)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.cardRadius))
                .overlay(AppBorder(cornerRadius: TipTrackTheme.cardRadius))
                .shadow(color: .black.opacity(0.04), radius: 12, y: 6)
            }
        }
    }
}

struct FieldStack<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    init(_ title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundColor(.zinc800)
            content
        }
    }
}

struct AppTextField: View {
    let placeholder: String
    @Binding var text: String
    var systemImage: String?

    var body: some View {
        HStack(spacing: 10) {
            if let systemImage {
                Image(systemName: systemImage)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.zinc500)
            }
            TextField(placeholder, text: $text)
                .font(.body)
                .foregroundColor(.zinc900)
        }
        .padding(.horizontal, 12)
        .frame(minHeight: 48)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
        .overlay(AppBorder(cornerRadius: TipTrackTheme.controlRadius))
    }
}

struct OrderCard: View {
    let order: TipOrder
    let onEdit: () -> Void

    var body: some View {
        Button(action: onEdit) {
            VStack(alignment: .leading, spacing: 14) {
                HStack(spacing: 8) {
                    Text("Order details")
                        .font(.caption.weight(.semibold))
                        .foregroundColor(.tipGreen)
                    Spacer()
                    Image(systemName: "pencil")
                        .font(.caption.weight(.bold))
                        .foregroundColor(.tipGreen)
                }

                HStack(alignment: .top, spacing: 12) {
                    AppIconTile(systemName: "receipt", tint: .tipGreen)
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Order #\(order.externalId)")
                            .font(.subheadline.weight(.semibold))
                            .foregroundColor(.zinc900)
                        Text(order.address)
                            .font(.caption)
                            .foregroundColor(.zinc500)
                            .lineLimit(2)
                    }
                    Spacer()
                }

                HStack(spacing: 8) {
                    TipBadge(category: TipCategory(rawValue: order.tip ?? -1))
                    Spacer()
                    Text(order.createdAt.formatted(.dateTime.month(.abbreviated).day().hour().minute()))
                        .font(.caption.weight(.medium))
                        .foregroundColor(.zinc500)
                }
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
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .top, spacing: 12) {
                AppIconTile(systemName: "building.2", tint: .tipGreen)
                VStack(alignment: .leading, spacing: 4) {
                    Text(location.address)
                        .font(.headline.weight(.semibold))
                        .foregroundColor(.zinc900)
                    Text("\(location.orders.count) saved order\(location.orders.count == 1 ? "" : "s")")
                        .font(.subheadline)
                        .foregroundColor(.zinc500)
                }
                Spacer()
                TipBadge(category: averageTip, compact: true)
            }

            VStack(alignment: .leading, spacing: 10) {
                ForEach(location.orders) { order in
                    Button {
                        editingOrder = order
                    } label: {
                        HStack(spacing: 10) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Order #\(order.externalId)")
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(.zinc900)
                                Text(order.createdAt.formatted(.dateTime.month(.abbreviated).day().year()))
                                    .font(.caption)
                                    .foregroundColor(.zinc500)
                            }
                            Spacer()
                            TipBadge(category: TipCategory(rawValue: order.tip ?? -1), compact: true)
                        }
                        .padding(.vertical, 2)
                    }
                    .buttonStyle(.plain)

                    if order.id != location.orders.last?.id {
                        Divider()
                    }
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
        AppTextField(placeholder: placeholder, text: $text, systemImage: "magnifyingglass")
            .textInputAutocapitalization(.never)
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
                    .font(.subheadline)
                    .foregroundColor(.zinc500)
                    .padding()
            } else {
                ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                    row(item)
                        .buttonStyle(.plain)
                        .padding()

                    if index < items.count - 1 {
                        Divider()
                    }
                }
            }
        }
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.cardRadius))
        .overlay(AppBorder(cornerRadius: TipTrackTheme.cardRadius))
        .shadow(color: .black.opacity(0.04), radius: 12, y: 6)
    }
}

struct EmptyPrompt: View {
    let message: String

    init(_ message: String) {
        self.message = message
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            AppIconTile(systemName: "sparkle.magnifyingglass", tint: .zinc500)
            Text(message)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.zinc500)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard()
    }
}

struct AppBackground: View {
    var body: some View {
        ZStack(alignment: .topTrailing) {
            Color.appBackground
            Circle()
                .fill(Color.tipGreen.opacity(0.08))
                .frame(width: 260, height: 260)
                .offset(x: 96, y: -128)
            Circle()
                .fill(Color.tipAmber.opacity(0.08))
                .frame(width: 180, height: 180)
                .offset(x: -220, y: 280)
        }
        .ignoresSafeArea()
    }
}

struct AppBorder: View {
    let cornerRadius: CGFloat

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius)
            .stroke(Color.zinc200, lineWidth: 1)
    }
}

struct AppIconTile: View {
    let systemName: String
    var tint: Color = .tipGreen

    var body: some View {
        Image(systemName: systemName)
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(tint)
            .frame(width: 34, height: 34)
            .background(tint.opacity(0.11))
            .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius))
            .overlay(
                RoundedRectangle(cornerRadius: TipTrackTheme.controlRadius)
                    .stroke(tint.opacity(0.18), lineWidth: 1)
            )
    }
}

struct TipBadge: View {
    let category: TipCategory?
    var compact = false

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: category?.symbolName ?? "minus.circle")
                .font(.caption.weight(.bold))
            if !compact {
                Text(category?.label ?? "No Tip Recorded")
                    .font(.caption.weight(.semibold))
            }
        }
        .foregroundColor(tint)
        .padding(.horizontal, compact ? 8 : 10)
        .padding(.vertical, 6)
        .background(tint.opacity(0.11))
        .clipShape(Capsule())
    }

    private var tint: Color {
        guard let category else { return .zinc500 }
        switch category {
        case .none:
            return .zinc500
        case .underFive:
            return .tipAmber
        case .fiveToTen:
            return .tipBlue
        case .overTen:
            return .tipGreen
        case .overTwenty:
            return .tipRose
        }
    }
}

struct StatTile: View {
    let title: String
    let value: String
    let systemImage: String
    var tint: Color = .tipGreen

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            AppIconTile(systemName: systemImage, tint: tint)
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.title3.weight(.bold))
                    .foregroundColor(.zinc900)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                Text(title)
                    .font(.caption.weight(.medium))
                    .foregroundColor(.zinc500)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .appCard(padding: 14)
    }
}

extension View {
    func appCard(padding: CGFloat = 16) -> some View {
        self
            .padding(padding)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: TipTrackTheme.cardRadius))
            .overlay(AppBorder(cornerRadius: TipTrackTheme.cardRadius))
            .shadow(color: .black.opacity(0.05), radius: 16, y: 8)
    }

    func appNavigationTitle(_ title: String) -> some View {
        self
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
    }
}

extension Color {
    static let appBackground = Color(red: 0.98, green: 0.98, blue: 0.97)
    static let tipGreen = Color(red: 0.05, green: 0.52, blue: 0.26)
    static let tipAmber = Color(red: 0.78, green: 0.43, blue: 0.05)
    static let tipBlue = Color(red: 0.10, green: 0.35, blue: 0.72)
    static let tipRose = Color(red: 0.75, green: 0.16, blue: 0.30)
    static let zinc50 = Color(red: 0.98, green: 0.98, blue: 0.98)
    static let zinc100 = Color(red: 0.96, green: 0.96, blue: 0.96)
    static let zinc200 = Color(red: 0.90, green: 0.90, blue: 0.91)
    static let zinc400 = Color(red: 0.63, green: 0.63, blue: 0.66)
    static let zinc500 = Color(red: 0.44, green: 0.44, blue: 0.48)
    static let zinc800 = Color(red: 0.15, green: 0.15, blue: 0.16)
    static let zinc900 = Color(red: 0.09, green: 0.09, blue: 0.10)
}
