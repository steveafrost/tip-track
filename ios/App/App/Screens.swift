import SwiftUI

struct SignInView: View {
    @EnvironmentObject private var store: TipTrackStore
    @State private var name = ""
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    var body: some View {
        ZStack {
            AppBackground()
            VStack(spacing: 24) {
                Spacer()
                Image(systemName: "wallet.pass.fill")
                    .font(.system(size: 82, weight: .bold))
                    .foregroundColor(.zinc900)
                VStack(spacing: 8) {
                    Text("Tip Track")
                        .font(.system(size: 44, weight: .bold))
                        .foregroundColor(.zinc900)
                    Text("Track delivery orders, locations, and tip history.")
                        .font(.headline)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Driver Name")
                        .font(.headline)
                    TextField("Enter your name", text: $name)
                        .textInputAutocapitalization(.words)
                        .submitLabel(.go)
                        .onSubmit(signIn)
                        .textFieldStyle(.roundedBorder)

                    if let errorMessage {
                        Text(errorMessage)
                            .font(.footnote.weight(.semibold))
                            .foregroundColor(.red)
                    }

                    Button(action: signIn) {
                        if isSubmitting {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            Text("Sign In")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .tint(.tipGreen)
                    .disabled(isSubmitting)
                }
                .appCard()
                Spacer()
            }
            .padding(20)
        }
    }

    private func signIn() {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard trimmedName.count >= 2 else {
            errorMessage = "Name must contain at least 2 characters."
            return
        }

        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                try await store.signIn(name: trimmedName)
            } catch {
                errorMessage = error.localizedDescription
            }

            isSubmitting = false
        }
    }
}

struct AddOrderView: View {
    @EnvironmentObject private var store: TipTrackStore
    @StateObject private var addressSearch = AddressSearch()
    @State private var address = ""
    @State private var latitude = 0.0
    @State private var longitude = 0.0
    @State private var orderId = ""
    @State private var errorMessage: String?
    @State private var didAddOrder = false
    @State private var isSubmitting = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                AddressLookupField(
                    title: "Address",
                    address: $address,
                    latitude: $latitude,
                    longitude: $longitude,
                    search: addressSearch
                )

                VStack(alignment: .leading, spacing: 8) {
                    Text("Order ID")
                        .font(.headline)
                    TextField("Enter an order ID", text: $orderId)
                        .textInputAutocapitalization(.characters)
                        .textFieldStyle(.roundedBorder)
                }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.footnote.weight(.semibold))
                        .foregroundColor(.red)
                }

                Button {
                    addOrder()
                } label: {
                    if isSubmitting {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                    } else {
                        Label("Submit", systemImage: "plus.circle.fill")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .tint(.tipGreen)
                .disabled(isSubmitting)
            }
            .appCard()
            .padding()
        }
        .background(AppBackground())
        .alert("Order added", isPresented: $didAddOrder) {
            Button("OK", role: .cancel) {}
        }
    }

    private func addOrder() {
        let trimmedAddress = address.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedOrderId = orderId.trimmingCharacters(in: .whitespacesAndNewlines)

        guard trimmedAddress.count >= 2 else {
            errorMessage = "Please choose a location from the list."
            return
        }
        guard trimmedOrderId.count >= 2 else {
            errorMessage = "Order ID must contain at least 2 characters."
            return
        }
        guard !store.hasOrder(externalId: trimmedOrderId) else {
            errorMessage = "That order ID is already saved."
            return
        }

        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                try await store.addOrder(
                    address: trimmedAddress,
                    latitude: latitude,
                    longitude: longitude,
                    externalId: trimmedOrderId
                )
                address = ""
                latitude = 0
                longitude = 0
                orderId = ""
                didAddOrder = true
            } catch {
                errorMessage = error.localizedDescription
            }

            isSubmitting = false
        }
    }
}

struct OrderSearchView: View {
    @EnvironmentObject private var store: TipTrackStore
    @State private var query = ""
    @State private var selectedOrder: TipOrder?
    @State private var editingOrder: TipOrder?

    private var matches: [TipOrder] {
        store.orders
            .filter { query.isEmpty || $0.externalId.localizedCaseInsensitiveContains(query) }
            .prefix(5)
            .map { $0 }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                SearchField("Enter Order ID", text: $query)

                if query.isEmpty && selectedOrder == nil {
                    EmptyPrompt("Search for an order to display the location and tip associated with that order.")
                }

                if !query.isEmpty {
                    ResultsList(items: matches, emptyText: "No orders found") { order in
                        Button {
                            selectedOrder = order
                            query = order.externalId
                        } label: {
                            HStack {
                                Text("Order #\(order.externalId)")
                                Spacer()
                                Image(systemName: "chevron.right")
                            }
                        }
                    }
                }

                if let selectedOrder {
                    OrderCard(order: selectedOrder) {
                        editingOrder = selectedOrder
                    }
                }
            }
            .padding()
        }
        .background(AppBackground())
        .sheet(item: $editingOrder, onDismiss: refreshSelection) { order in
            OrderEditor(order: order, allowsLocationEditing: true)
        }
    }

    private func refreshSelection() {
        guard let selectedOrder else { return }
        self.selectedOrder = store.orders.first { $0.id == selectedOrder.id }
    }
}

struct LocationSearchView: View {
    @EnvironmentObject private var store: TipTrackStore
    @State private var query = ""
    @State private var selectedLocation: TipLocation?
    @State private var editingOrder: TipOrder?

    private var matches: [TipLocation] {
        store.locations
            .filter { location in
                query.isEmpty
                    || location.address.localizedCaseInsensitiveContains(query)
                    || location.orders.contains { $0.externalId.localizedCaseInsensitiveContains(query) }
            }
            .prefix(5)
            .map { $0 }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                SearchField("Enter address", text: $query)

                if query.isEmpty && selectedLocation == nil {
                    EmptyPrompt("Search for a location to display all orders and tips associated with that address.")
                }

                if !query.isEmpty {
                    ResultsList(items: matches, emptyText: "No location found") { location in
                        Button {
                            selectedLocation = location
                            query = location.address
                        } label: {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(location.address)
                                Text(location.orders.map(\.externalId).joined(separator: " | "))
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }

                if let selectedLocation {
                    LocationCard(location: selectedLocation, editingOrder: $editingOrder)
                }
            }
            .padding()
        }
        .background(AppBackground())
        .sheet(item: $editingOrder, onDismiss: refreshSelection) { order in
            OrderEditor(order: order, allowsLocationEditing: false)
        }
    }

    private func refreshSelection() {
        guard let selectedLocation else { return }
        self.selectedLocation = store.locations.first { $0.id == selectedLocation.id }
    }
}

struct ReportsView: View {
    @EnvironmentObject private var store: TipTrackStore

    private var buckets: [TipBucket] {
        TipCategory.allCases.map { category in
            TipBucket(category: category, count: store.orders.filter { ($0.tip ?? 0) == category.rawValue }.count)
        }
    }

    private var maxCount: Int {
        max(buckets.map(\.count).max() ?? 0, 1)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                if store.orders.isEmpty {
                    EmptyPrompt("No data to display")
                } else {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Tips by Type")
                            .font(.title3.weight(.semibold))

                        ForEach(buckets) { bucket in
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text(bucket.category.label)
                                    Spacer()
                                    Text("\(bucket.count)")
                                        .font(.headline)
                                }
                                GeometryReader { proxy in
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(Color.tipGreen.opacity(0.25))
                                        .overlay(alignment: .leading) {
                                            RoundedRectangle(cornerRadius: 6)
                                                .fill(Color.tipGreen)
                                                .frame(width: proxy.size.width * CGFloat(bucket.count) / CGFloat(maxCount))
                                        }
                                }
                                .frame(height: 12)
                            }
                        }
                    }
                    .appCard()
                }
            }
            .padding()
        }
        .background(AppBackground())
    }
}


struct OrderEditor: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var store: TipTrackStore
    @StateObject private var addressSearch = AddressSearch()
    @State private var address: String
    @State private var latitude: Double
    @State private var longitude: Double
    @State private var selectedTip: TipCategory
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    let order: TipOrder
    let allowsLocationEditing: Bool

    init(order: TipOrder, allowsLocationEditing: Bool) {
        self.order = order
        self.allowsLocationEditing = allowsLocationEditing
        _address = State(initialValue: order.address)
        _latitude = State(initialValue: order.latitude)
        _longitude = State(initialValue: order.longitude)
        _selectedTip = State(initialValue: TipCategory(rawValue: order.tip ?? 0) ?? .none)
    }

    var body: some View {
        NavigationView {
            Form {
                if allowsLocationEditing {
                    Section("Address") {
                        AddressLookupField(
                            title: "Address",
                            address: $address,
                            latitude: $latitude,
                            longitude: $longitude,
                            search: addressSearch
                        )
                    }
                }

                Section("Tip Amount") {
                    Picker("Tip Amount", selection: $selectedTip) {
                        ForEach(TipCategory.allCases) { category in
                            Text(category.label).tag(category)
                        }
                    }
                    .pickerStyle(.inline)
                }

                if let errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                }
            }
            .navigationTitle(allowsLocationEditing ? "Edit Order #\(order.externalId)" : "Tip for Order #\(order.externalId)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(isSubmitting ? "Updating" : "Update") { update() }
                        .disabled(isSubmitting)
                }
            }
        }
    }

    private func update() {
        let trimmedAddress = address.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !allowsLocationEditing || trimmedAddress.count >= 2 else {
            errorMessage = "Please choose a location from the list."
            return
        }

        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                try await store.updateOrder(
                    id: order.id,
                    address: allowsLocationEditing ? trimmedAddress : order.address,
                    latitude: allowsLocationEditing ? latitude : order.latitude,
                    longitude: allowsLocationEditing ? longitude : order.longitude,
                    tip: selectedTip.rawValue
                )
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
            }

            isSubmitting = false
        }
    }
}

struct HelpView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            List {
                HelpSection(title: "Track Orders", text: "As orders are accepted, add the order to keep track of the order and its location. Locations with multiple orders show the full order history.")
                HelpSection(title: "Record Tips", text: "Enter tips after every shift to build an accurate picture of your earnings patterns.")
                HelpSection(title: "View Average Tips", text: "Use the locations tab to view the average tip for a specific address.")
            }
            .navigationTitle("Help")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct HelpSection: View {
    let title: String
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.headline)
            Text(text)
        }
        .padding(.vertical, 6)
    }
}
