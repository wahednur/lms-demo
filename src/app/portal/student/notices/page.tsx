"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { NoticeListItem } from "@/components/domain/public/notice-list-item";
import { useCurrentStudent } from "@/hooks/use-current-student";
import { useAsync } from "@/hooks/use-async";
import { noticeService } from "@/services";
import { useLanguage } from "@/lib/i18n/context";

export default function StudentNoticesPage() {
  const { data: student, loading: studentLoading } = useCurrentStudent();
  const { t } = useLanguage();
  const { data: notices, loading } = useAsync(
    () => (student ? noticeService.list({ audience: "students", departmentId: student.departmentId }) : Promise.resolve([])),
    [student?.departmentId],
  );

  if (studentLoading || loading || !notices) return <PageLoading label={t("table.loading")} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.notices.short")} />
      <div className="grid gap-3">
        {notices.length === 0 ? (
          <EmptyState title={t("empty.noNotices")} />
        ) : (
          notices.map((n) => <NoticeListItem key={n.id} notice={n} />)
        )}
      </div>
    </div>
  );
}
