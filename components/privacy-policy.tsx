import React from "react";
import Link from "next/link";
import type { PrivacyPolicyFacts } from "@/lib/privacy-policy";

export function PrivacyPolicy({ facts }: { facts: PrivacyPolicyFacts }) {
  return <main className="mx-auto max-w-2xl space-y-7 px-6 py-12 text-zinc-900">
    <Link href="/" className="font-semibold text-green-800">TipTrack</Link>
    <header><h1 className="mt-5 text-3xl font-bold">Privacy policy</h1>
      <p className="mt-2 text-sm text-zinc-600">Effective {facts.effectiveDate}</p></header>
    <section><h2 className="text-xl font-semibold">Who operates TipTrack</h2>
      <p className="mt-2">{facts.operator} operates TipTrack. For privacy questions or a data deletion request, contact <a className="underline" href={`mailto:${facts.contactEmail}`}>{facts.contactEmail}</a>.</p></section>
    <section><h2 className="text-xl font-semibold">Information used to provide your log</h2>
      <p className="mt-2">TipTrack stores the account identifier returned by your sign-in provider and, when supplied, your name and email address. Connected Apple and Google identities link to your TipTrack account.</p>
      <p className="mt-2">The service stores the order identifiers, tip categories and delivery addresses and coordinates you enter, together with creation and update times, to provide your delivery log. Account-scoped orders are also cached on your device.</p>
      <p className="mt-2">App Store product and transaction identifiers, purchase dates and entitlement status are recorded to verify purchased access. Apple processes App Store payments.</p></section>
    <section><h2 className="text-xl font-semibold">Service providers and sharing</h2>
      <p className="mt-2">{facts.serviceProviders}</p><p className="mt-2">{facts.otherUsesAndSharing}</p></section>
    <section><h2 className="text-xl font-semibold">Retention and deletion</h2>
      <p className="mt-2">{facts.retention}</p>
      <p className="mt-2">Signing out does not delete your account or the cached log. Request deletion by contacting {facts.contactEmail}, or use Delete account in the iOS Account screen when available. In the app, review the confirmation and sign in again with a connected login. Deleting your TipTrack account does not delete your Apple or Google account or cancel or refund an App Store purchase.</p>
      <p className="mt-2">When automatic provider revocation is unavailable, the app explains how to remove TipTrack from Sign in with Apple or your Google account connections. It does not claim that signing out revokes provider access.</p></section>
    <section><h2 className="text-xl font-semibold">Your choices</h2>
      <p className="mt-2">You can sign out in the app, remove provider access in Apple or Google account settings, and contact us about access to or deletion of your information.</p></section>
  </main>;
}
