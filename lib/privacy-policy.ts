export type PrivacyPolicyFacts = {
  effectiveDate: string;
  operator: string;
  contactEmail: string;
  retention: string;
  serviceProviders: string;
  otherUsesAndSharing: string;
};

// Owner confirmation: 2026-10-06, messageSentinel_24798751cc008191ba028ce160a2e1ff.
// Provider backup/log expiry windows remain unverified; do not invent deadlines.
export const approvedPrivacyPolicy: PrivacyPolicyFacts | null = {
  effectiveDate: "October 6, 2026",
  operator: "Steve Frost",
  contactEmail: "hello@steveafrost.com",
  retention: "Active account, delivery-log and purchase-verification records are retained to run TipTrack until you request account deletion. Deletion removes records belonging to your account from active TipTrack storage and clears that account's cached log on the device completing deletion. Other users' records and locations still used by other accounts are preserved. Apple controls its own App Store purchase records; deleting TipTrack records does not erase Apple's records. Hosting, database and authentication providers may retain backups and operational or authentication logs after active records are removed. Their configured expiry periods have not yet been verified, so we do not promise immediate erasure of those copies or logs. Contact us for the current details or to request deletion.",
  serviceProviders: "TipTrack uses Vercel for hosting, a hosted PostgreSQL database for application records, and Clerk for web authentication. Apple and Google provide connected sign-in services; map and address features use Apple or Google services as applicable. Apple processes App Store purchases. These services process information needed to provide their respective functions.",
  otherUsesAndSharing: "Steve Frost does not use or share your information for purposes beyond running TipTrack. Information is processed by the service providers described above to operate the app.",
};
