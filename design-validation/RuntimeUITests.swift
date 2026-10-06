import XCTest
final class TipTrackDesignUITests: XCTestCase {
    let app = XCUIApplication(bundleIdentifier: "com.steveafrost.tiptrack")
    @MainActor func capture(_ name: String) {
        Thread.sleep(forTimeInterval: 0.8)
        let shot = XCTAttachment(screenshot: app.screenshot())
        shot.name = name; shot.lifetime = .keepAlways; add(shot)
    }
    @MainActor func field(_ id: String) -> XCUIElement {
        let text = app.textFields[id].firstMatch
        if text.exists { return text }
        return app.textViews[id].firstMatch
    }
    @MainActor func scrollTo(_ element: XCUIElement) {
        for _ in 0..<5 { if element.isHittable { return }; app.swipeUp() }
    }
    @MainActor func testProductionColdLaunch() {
        continueAfterFailure = false
        for _ in 0..<2 {
            app.launch()
            XCTAssertTrue(app.wait(for: .runningForeground, timeout: 15))
            XCTAssertTrue(app.buttons["Preview demo log"].firstMatch.waitForExistence(timeout: 10))
            capture("production-config-sign-in")
            app.terminate()
        }
    }
    @MainActor func testGroupedFormAndPersistence() {
        continueAfterFailure = false
        app.launch()
        XCTAssertTrue(app.buttons["save-order"].waitForExistence(timeout: 15))
        let address = field("order-address")
        XCTAssertTrue(address.exists, app.debugDescription)
        address.tap(); address.typeText("315 Liberty St, Ann Arbor, MI")
        let order = field("order-id")
        XCTAssertTrue(order.exists, app.debugDescription)
        scrollTo(order); order.tap(); order.typeText("C3307\n")
        let selected = app.buttons["tip-2"]
        scrollTo(selected); selected.tap()
        XCTAssertTrue(selected.isSelected)
        capture("grouped-form-target-light")
        for id in ["tip-later", "tip-0", "tip-1", "tip-2", "tip-3", "tip-4"] {
            let choice = app.buttons[id]; scrollTo(choice)
            XCTAssertTrue(choice.isHittable); choice.tap(); XCTAssertTrue(choice.isSelected)
        }
        selected.tap()
        let save = app.buttons["save-order"]; scrollTo(save); save.tap()
        XCTAssertTrue(app.alerts["Order added"].waitForExistence(timeout: 10))
        app.alerts.buttons["OK"].tap()
        app.buttons["Orders"].firstMatch.tap()
        let search = app.textFields.firstMatch; search.tap(); search.typeText("C3307\n")
        let saved = app.staticTexts["Order #C3307"].firstMatch
        XCTAssertTrue(saved.waitForExistence(timeout: 5)); saved.tap()
        let details = app.staticTexts["Order details"].firstMatch; scrollTo(details); details.tap()
        XCTAssertTrue(app.buttons["Update"].firstMatch.waitForExistence(timeout: 5))
        let tip = app.buttons["More Than $20"].firstMatch; scrollTo(tip); tip.tap()
        app.buttons["Update"].firstMatch.tap()
        capture("edited-order")
        app.terminate(); app.launch()
        XCTAssertTrue(app.buttons["Orders"].firstMatch.waitForExistence(timeout: 10)); app.buttons["Orders"].firstMatch.tap()
        XCTAssertTrue(app.staticTexts["Order #C3307"].firstMatch.waitForExistence(timeout: 5))
        capture("persisted-orders-after-relaunch")
        app.buttons["Locations"].firstMatch.tap()
        XCTAssertTrue(app.staticTexts["Location history"].waitForExistence(timeout: 5)); capture("locations")
        app.buttons["Reports"].firstMatch.tap()
        XCTAssertTrue(app.staticTexts["Tips by type"].waitForExistence(timeout: 5)); capture("reports")
        app.buttons["Add"].firstMatch.tap()
        XCTAssertTrue(app.buttons["save-order"].exists)
        app.terminate()
    }
    @MainActor func testCaptureAppearanceAndKeyboard() {
        continueAfterFailure = false
        app.launch()
        XCTAssertTrue(app.buttons["save-order"].waitForExistence(timeout: 15))
        capture("appearance-empty-form")
        let address = field("order-address"); address.tap()
        address.typeText("315 Liberty St, Ann Arbor, MI")
        capture("appearance-address-keyboard")
        let order = field("order-id"); scrollTo(order); order.tap(); order.typeText("TYPE-28\n")
        let selected = app.buttons["tip-2"]; scrollTo(selected); selected.tap()
        capture("appearance-tip-selected")
        let save = app.buttons["save-order"]; scrollTo(save)
        XCTAssertTrue(save.isHittable)
        capture("appearance-save-visible")
        for tab in ["Orders", "Locations", "Reports", "Add"] {
            XCTAssertTrue(app.buttons[tab].firstMatch.isHittable)
            app.buttons[tab].firstMatch.tap()
        }
        app.terminate()
    }
    @MainActor func testSoftwareKeyboardGeometry() {
        continueAfterFailure = false
        app.launch()
        XCTAssertTrue(app.buttons["save-order"].waitForExistence(timeout: 15))
        let address = field("order-address"); address.tap()
        print("SOFTWARE_KEYBOARD_PRESENT=\(app.keyboards.firstMatch.waitForExistence(timeout: 5))")
        let shot = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        shot.name = "device-keyboard-geometry"; shot.lifetime = .keepAlways; add(shot)
        print("KEYBOARD_TREE\n" + app.debugDescription)
        app.terminate()
    }

}
