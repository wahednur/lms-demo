import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { futureFeatureService } from "@/services";
import { FutureFeatureDetail } from "@/components/domain/public/future-feature-detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const feature = await futureFeatureService.getById(id);
  return { title: feature ? feature.title.en : "Future Feature" };
}

export default async function FutureFeatureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feature = await futureFeatureService.getById(id);
  if (!feature || !feature.hasPreview) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <FutureFeatureDetail feature={feature} />
    </div>
  );
}
