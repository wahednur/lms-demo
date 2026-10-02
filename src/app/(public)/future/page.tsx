import type { Metadata } from "next";
import { futureFeatureService } from "@/services";
import { FutureFeatureGrid } from "@/components/domain/public/future-feature-grid";

export const metadata: Metadata = { title: "Future Scope" };

export default async function FuturePage() {
  const features = await futureFeatureService.list();
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <FutureFeatureGrid features={features} />
    </div>
  );
}
