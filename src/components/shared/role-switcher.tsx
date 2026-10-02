"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/components/shared/session-provider";
import { useLanguage, useBilingual } from "@/lib/i18n/context";
import { ROLE_LABEL } from "@/lib/permissions/matrix";
import { ROLE_HOME } from "@/lib/permissions/routes";
import { sessionService } from "@/services";
import type { SystemUser } from "@/types";

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const { user, loginAs } = useSession();
  const { t } = useLanguage();
  const bilingual = useBilingual();
  const router = useRouter();
  const [accounts, setAccounts] = useState<SystemUser[]>([]);

  useEffect(() => {
    sessionService.listDemoAccounts().then(setAccounts);
  }, []);

  const handleSwitch = async (account: SystemUser) => {
    if (account.id === user?.id) return;
    try {
      await loginAs(account.id);
      toast.success(`${t("demo.sessionAs")}: ${bilingual(account.name)} (${bilingual(ROLE_LABEL[account.role])})`);
      router.push(ROLE_HOME[account.role]);
    } catch {
      toast.error(t("feedback.saveFailed"));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" aria-label={t("action.switchRole")}>
          <Avatar className="size-5">
            <AvatarFallback className="text-[10px]">{user?.name.en ? initials(user.name.en) : <UserRound className="size-3" />}</AvatarFallback>
          </Avatar>
          {!compact && (
            <span className="max-w-[9rem] truncate">{user ? bilingual(user.name) : t("action.switchRole")}</span>
          )}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {t("action.switchRole")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onSelect={() => handleSwitch(account)}
            className="flex items-center gap-2"
          >
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">{initials(account.name.en)}</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm">{bilingual(account.name)}</span>
              <span className="truncate text-xs text-muted-foreground">{bilingual(ROLE_LABEL[account.role])}</span>
            </span>
            {account.id === user?.id && <span className="ml-auto text-xs text-primary">●</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function initials(nameEn: string): string {
  return nameEn.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}
