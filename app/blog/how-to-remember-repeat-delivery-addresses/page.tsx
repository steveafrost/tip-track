import type { Metadata } from "next";
import { Clock3, MapPin, Search } from "lucide-react";

import { TipTrackGuidePage } from "@/components/tiptrack-guide-page";

const appStoreUrl =
  "https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-repeat-address-guide";

export const metadata: Metadata = {
  title: "How to Remember Repeat Delivery Addresses",
  description:
    "Use a simple iPhone location history to look up delivery addresses and the tip ranges you recorded there when a repeat location appears.",
  alternates: {
    canonical: "/blog/how-to-remember-repeat-delivery-addresses",
  },
  openGraph: {
    title: "How to Remember Repeat Delivery Addresses",
    description:
      "Save delivery addresses and look up the history you personally logged when a location appears again.",
    url: "https://usetiptrack.com/blog/how-to-remember-repeat-delivery-addresses",
  },
};

export default function RepeatDeliveryAddressesGuidePage() {
  return (
    <TipTrackGuidePage
      path="/blog/how-to-remember-repeat-delivery-addresses"
      title="How to remember repeat delivery addresses."
      description="Use a simple iPhone location history to look up delivery addresses and the tip ranges you recorded there when a repeat location appears."
      eyebrow="Use your own recorded location history"
      intro="When a delivery address looks familiar, a saved history is more useful than trying to remember the previous shift. Keep the address with the order, then look up what you chose to record there."
      appStoreUrl={appStoreUrl}
      heroImage="locations"
      heroAlt="TipTrack iPhone locations screen with saved delivery addresses and their recorded history."
      steps={[
        {
          icon: MapPin,
          title: "Save the address with the order",
          description:
            "Record the delivery address when you save the completed order, so the location becomes part of your searchable history.",
        },
        {
          icon: Search,
          title: "Look up the location when it returns",
          description:
            "Search the saved location history when an address appears again instead of relying on a vague memory of a prior delivery.",
        },
        {
          icon: Clock3,
          title: "Review only what you recorded",
          description:
            "The history reflects the orders and tip ranges you personally logged. It is not a prediction about a future delivery.",
        },
      ]}
      manualLogTitle="Repeat-address history is useful because it stays honest about its source."
      manualLogParagraphs={[
        "A saved location can give a repeat delivery context: the orders you recorded there and the tip ranges you attached to those orders. That is a helpful reference without pretending to know what will happen next.",
        "TipTrack keeps this history manual. You decide what to save, and you can update a saved tip range later if a delayed tip is reported.",
      ]}
      secondaryImage="reports"
      secondaryAlt="TipTrack iPhone reports screen with a saved tip-range distribution."
      relatedGuides={[
        {
          href: "/blog/how-to-track-delivery-tips-on-iphone",
          title: "Keep a delivery tip history on iPhone",
          description: "Save a delivery, update a later tip, and use your own history.",
        },
        {
          href: "/blog/how-to-track-delayed-delivery-tips-on-iphone",
          title: "Track delayed delivery tips",
          description: "Connect a later tip update to the order you already saved.",
        },
        {
          href: "/blog/delivery-order-history-without-spreadsheet",
          title: "Keep order history without a spreadsheet",
          description: "Focus on the order details you will want to retrieve later.",
        },
      ]}
    />
  );
}
