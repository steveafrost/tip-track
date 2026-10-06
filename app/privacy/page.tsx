import { notFound } from "next/navigation";
import { PrivacyPolicy } from "@/components/privacy-policy";
import { approvedPrivacyPolicy } from "@/lib/privacy-policy";

export const metadata = { title: "TipTrack privacy policy" };
export default function PrivacyPage() {
  if (!approvedPrivacyPolicy) notFound();
  return <PrivacyPolicy facts={approvedPrivacyPolicy} />;
}
