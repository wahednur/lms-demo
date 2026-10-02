"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAsync } from "@/hooks/use-async";
import { useSession } from "@/components/shared/session-provider";
import { academicService, examService } from "@/services";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { canPublishResults } from "@/lib/permissions/can";
import { ServiceError } from "@/types";

export default function AdminResultsPage() {
  const { t, locale } = useLanguage();
  const bilingual = useBilingual();
  const { user } = useSession();
  const [publishing, setPublishing] = useState<string | null>(null);

  const { data, loading, reload } = useAsync(async () => {
    const [examinations, allMarks, departments] = await Promise.all([
      examService.listExaminations(),
      examService.listMarks(),
      academicService.listDepartments(),
    ]);
    const deptById = new Map(departments.map((d) => [d.id, d]));
    const rows = examinations
      .map((exam) => {
        const examMarks = allMarks.filter((m) => m.examId === exam.id);
        const verified = examMarks.filter((m) => m.status === "verified").length;
        const published = examMarks.filter((m) => m.status === "published").length;
        const pending = examMarks.filter((m) => m.status === "draft" || m.status === "submitted").length;
        return { exam, total: examMarks.length, verified, published, pending, department: deptById.get(exam.departmentId) };
      })
      .filter((r) => r.total > 0 && r.published < r.total)
      .sort((a, b) => b.exam.endDate.localeCompare(a.exam.endDate));
    return { rows };
  }, []);

  if (loading || !data) return <PageLoading label={t("table.loading")} />;

  const canPublish = user ? canPublishResults(user.role) : false;

  const handlePublish = async (examId: string) => {
    if (!user) return;
    setPublishing(examId);
    try {
      const updated = await examService.publishResults(examId, user.id);
      toast.success(locale === "bn" ? `${updated.length} টি ফলাফল প্রকাশিত হয়েছে।` : `${updated.length} result entries published.`);
      reload();
    } catch (err) {
      toast.error(err instanceof ServiceError ? err.message : t("feedback.saveFailed"));
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("nav.admin.results")} description={locale === "bn" ? "সেমিস্টার ফলাফল প্রকাশ ও পর্যালোচনা" : "Semester result publication & review"} />

      {!canPublish && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
          <Lock className="size-4" />
          {locale === "bn" ? "শুধুমাত্র অধ্যক্ষ চূড়ান্ত ফলাফল প্রকাশ করতে পারেন।" : "Only the Principal can give final publication approval."}
        </div>
      )}

      {data.rows.length === 0 ? (
        <EmptyState title={locale === "bn" ? "প্রকাশের জন্য কোনো ফলাফল অপেক্ষমাণ নেই" : "No results pending publication"} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">{locale === "bn" ? "পরীক্ষা" : "Examination"}</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("common.department")}</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "যাচাইকৃত" : "Verified"}</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">{locale === "bn" ? "বাকি" : "Pending"}</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => {
                const ready = r.pending === 0 && r.verified > 0;
                return (
                  <tr key={r.exam.id} className="border-t border-border even:bg-muted/20">
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-foreground">{bilingual(r.exam.name)}</p>
                      <p className="text-xs text-muted-foreground">{t("common.semester")} {r.exam.semester} · {r.exam.shift} · {r.exam.session}</p>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.department ? bilingual(r.department.name) : "—"}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{r.verified}/{r.total}</td>
                    <td className="px-3 py-2.5 text-right">
                      {r.pending > 0 ? <StatusBadge status="submitted" /> : <StatusBadge status="verified" />}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {canPublish && (
                        <Button
                          size="sm"
                          disabled={!ready || publishing !== null}
                          onClick={() => handlePublish(r.exam.id)}
                          className="gap-1.5"
                        >
                          {publishing === r.exam.id ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                          {t("action.publish")}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
