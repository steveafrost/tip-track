import type { Metadata } from "next";
import { Check, MapPin, Search } from "lucide-react";

import { TipTrackGuidePage } from "@/components/tiptrack-guide-page";

const appStoreUrl =
  "https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-order-history-guide";

export const metadata: Metadata = {
  title: "Delivery Order History Without a Spreadsheet",
  description:
    "Keep a simple iPhone delivery-order history with saved order IDs, addresses, and tip ranges instead of rebuilding details from a spreadsheet.",
  alternates: {
    canonical: "/blog/delivery-order-history-without-spreadsheet",
  },
  openGraph: {
    title: "Delivery Order History Without a Spreadsheet",
    description:
      "Save delivery order IDs, addresses, and tip ranges in a simple iPhone history you control.",
    url: "https://usetiptrack.com/blog/delivery-order-history-without-spreadsheet",
  },
};

export default function DeliveryOrderHistoryGuidePage() {
  return (
    <TipTrackGuidePage
      path="/blog/delivery-order-history-without-spreadsheet"
      title="Keep a delivery order history without a spreadsheet."
      description="Keep a simple iPhone delivery-order history with saved order IDs, addresses, and tip ranges instead of rebuilding details from a spreadsheet."
      eyebrow="A lighter post-delivery routine"
      intro="A useful delivery history does not need to become a financial spreadsheet. Start with the details you want to find again: the order ID, the address, and the tip range you recorded."
      appStoreUrl={appStoreUrl}
      heroImage="add-order"
      heroAlt="TipTrack iPhone add-order screen with fields for a delivery address and order ID."
      steps={[
        {
          icon: MapPin,
          title: "Keep the useful identifiers",
          description:
            "Save the completed delivery’s order ID and address. Those are the details that make a later lookup practical.",
        },
        {
          icon: Check,
          title: "Record a range, not false precision",
          description:
            "Use the tip range you know now, or return later. TipTrack’s reports are based on the ranges you personally save.",
        },
        {
          icon: Search,
          title: "Search the history you built",
          description:
            "Find an order by ID or delivery address without trying to remember which day or spreadsheet row held the detail.",
        },
      ]}
      manualLogTitle="Keep the record focused on what you need to retrieve later."
      manualLogParagraphs={[
        "For a manual delivery history, consistency matters more than collecting every possible field. Saving the order ID, address, and a tip range gives each delivery enough context to find again.",
        "TipTrack does not replace payout reporting or mileage tracking. It is an iPhone log for the delivery details and tip ranges you decide to keep.",
      ]}
      secondaryImage="reports"
      secondaryAlt="TipTrack iPhone reports screen showing the distribution of saved tip ranges."
      relatedGuides={[
        {
          href: "/blog/how-to-track-delivery-tips-on-iphone",
          title: "Keep a delivery tip history on iPhone",
          description: "A complete save, update, and repeat-address routine.",
        },
        {
          href: "/blog/how-to-track-delayed-delivery-tips-on-iphone",
          title: "Track delayed delivery tips",
          description: "Find the saved delivery and update its tip range later.",
        },
        {
          href: "/blog/how-to-remember-repeat-delivery-addresses",
          title: "Remember repeat delivery addresses",
          description: "Use your own saved location history when an address returns.",
        },
      ]}
    />
  );
}
