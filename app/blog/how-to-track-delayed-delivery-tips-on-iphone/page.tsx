import type { Metadata } from "next";
import { Clock3, MapPin, Search } from "lucide-react";

import { TipTrackGuidePage } from "@/components/tiptrack-guide-page";

const appStoreUrl =
  "https://apps.apple.com/us/app/tiptrack-delivery-log/id6771138274?ct=organic-delayed-tip-guide";

export const metadata: Metadata = {
  title: "How to Track Delayed Delivery Tips on iPhone",
  description:
    "A practical iPhone routine for saving a completed delivery, recording a tip range later, and keeping your own delivery history usable.",
  alternates: {
    canonical: "/blog/how-to-track-delayed-delivery-tips-on-iphone",
  },
  openGraph: {
    title: "How to Track Delayed Delivery Tips on iPhone",
    description:
      "Save the completed delivery, update its tip range later, and keep the history you chose to record available on iPhone.",
    url: "https://usetiptrack.com/blog/how-to-track-delayed-delivery-tips-on-iphone",
  },
};

export default function DelayedDeliveryTipsGuidePage() {
  return (
    <TipTrackGuidePage
      path="/blog/how-to-track-delayed-delivery-tips-on-iphone"
      title="How to track delayed delivery tips on iPhone."
      description="A practical iPhone routine for saving a completed delivery, recording a tip range later, and keeping your own delivery history usable."
      eyebrow="A practical iPhone workflow"
      intro="When a tip is reported later, the useful part is being able to reconnect it to the order you already saved—not trying to reconstruct the shift from memory."
      appStoreUrl={appStoreUrl}
      heroImage="add-order"
      heroAlt="TipTrack iPhone add-order screen with an address, order ID, and tip-range choices."
      steps={[
        {
          icon: MapPin,
          title: "Save the completed delivery",
          description:
            "After the delivery, record the order ID and address while they are still easy to find. Choose the tip range you know now or leave it for later.",
        },
        {
          icon: Clock3,
          title: "Come back when the tip updates",
          description:
            "When a later tip is reported, use the saved delivery rather than a guess. TipTrack lets you update the order’s saved tip range.",
        },
        {
          icon: Search,
          title: "Find it by order or address",
          description:
            "Search your saved history by order number or delivery address to locate the specific delivery you personally logged.",
        },
      ]}
      manualLogTitle="A delayed tip is easier to update when the delivery already has a home."
      manualLogParagraphs={[
        "A simple routine starts at the end of the delivery: save the order ID and address, then record a tip range or mark it for later. That creates a record you can return to when the detail changes.",
        "TipTrack is designed for that manual handoff. It keeps the history you chose to save available on iPhone, without claiming to import platform data or calculate earnings for you.",
      ]}
      secondaryImage="reports"
      secondaryAlt="TipTrack iPhone reports screen with a saved-order count and tip-range distribution."
      relatedGuides={[
        {
          href: "/blog/how-to-track-delivery-tips-on-iphone",
          title: "Keep a delivery tip history on iPhone",
          description: "A complete save, update, and repeat-address routine.",
        },
        {
          href: "/blog/delivery-order-history-without-spreadsheet",
          title: "Keep order history without a spreadsheet",
          description: "A small manual record for saved order IDs and addresses.",
        },
        {
          href: "/blog/how-to-remember-repeat-delivery-addresses",
          title: "Remember repeat delivery addresses",
          description: "Use the location history you personally saved.",
        },
      ]}
    />
  );
}
