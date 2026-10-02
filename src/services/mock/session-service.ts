import type { SessionService } from "@/services/contracts";
import type { DemoSession, SystemUser } from "@/types";
import { storage, STORAGE_KEYS } from "@/mocks/storage/storage";
import { USERS, DEMO_ACCOUNT_IDS } from "@/mocks/seed";
import { delay } from "@/lib/async";
import { auditService } from "./audit-service";

function readUsers(): SystemUser[] {
  return storage.read(STORAGE_KEYS.users, USERS);
}

export const sessionService: SessionService = {
  async getCurrentSession() {
    await delay(80);
    return storage.read<DemoSession | null>(STORAGE_KEYS.session, null);
  },

  async getCurrentUser() {
    const session = storage.read<DemoSession | null>(STORAGE_KEYS.session, null);
    if (!session) return null;
    const users = readUsers();
    return users.find((u) => u.id === session.userId) ?? null;
  },

  async listDemoAccounts() {
    await delay(150);
    const users = readUsers();
    const order = [
      DEMO_ACCOUNT_IDS.principal,
      DEMO_ACCOUNT_IDS.academic_incharge,
      DEMO_ACCOUNT_IDS.hod,
      DEMO_ACCOUNT_IDS.teacher,
      DEMO_ACCOUNT_IDS.student,
    ];
    return order.map((id) => users.find((u) => u.id === id)).filter((u): u is SystemUser => !!u);
  },

  async loginAs(userId: string) {
    await delay(200);
    const users = readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error(`Unknown demo user: ${userId}`);

    const session: DemoSession = { userId, role: user.role, startedAt: new Date().toISOString() };
    storage.write(STORAGE_KEYS.session, session);

    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, lastLoginAt: session.startedAt } : u,
    );
    storage.write(STORAGE_KEYS.users, updatedUsers);

    await auditService.record({
      actorUserId: user.id,
      actorRoleAtTime: user.role,
      action: "login",
      entityType: "session",
      entityId: user.id,
      summary: `${user.name.en} logged in as ${user.role.replace("_", " ")} (demo session).`,
    });

    return session;
  },

  async logout() {
    await delay(120);
    const session = storage.read<DemoSession | null>(STORAGE_KEYS.session, null);
    if (session) {
      const users = readUsers();
      const user = users.find((u) => u.id === session.userId);
      if (user) {
        await auditService.record({
          actorUserId: user.id,
          actorRoleAtTime: user.role,
          action: "logout",
          entityType: "session",
          entityId: user.id,
          summary: `${user.name.en} logged out.`,
        });
      }
    }
    storage.remove(STORAGE_KEYS.session);
  },
};
