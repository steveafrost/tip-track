import qrcode

APP_STORE_URL = "https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=qr-ios"
OUTPUT_PATH = "public/images/campaign/tiptrack-ios-app-store-qr.png"

qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=16,
    border=3,
)
qr.add_data(APP_STORE_URL)
qr.make(fit=True)
qr.make_image(fill_color="#073f31", back_color="white").save(OUTPUT_PATH)

print(OUTPUT_PATH)
