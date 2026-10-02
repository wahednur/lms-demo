import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { noticeService } from "@/services";
import { NoticeDetailContent } from "@/components/domain/public/notice-detail-content";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const notice = await noticeService.getById(id);
  return { title: notice ? notice.title.en : "Notice" };
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = await noticeService.getById(id);
  if (!notice) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <NoticeDetailContent notice={notice} />
    </div>
  );
}
