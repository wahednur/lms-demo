import type { DemoSession, SystemUser } from "@/types";

/**
 * Simulated authentication. There is no password, no server, no real
 * identity — `loginAs` simply records which demo user id is "active" in
 * localStorage. Production deployment MUST replace this with real
 * authentication and server-verified sessions (see README backend
 * integration checklist).
 */
export interface SessionService {
  getCurrentSession(): Promise<DemoSession | null>;
  getCurrentUser(): Promise<SystemUser | null>;
  /** One representative, clearly-fictional account per role, shown on /login. */
  listDemoAccounts(): Promise<SystemUser[]>;
  loginAs(userId: string): Promise<DemoSession>;
  logout(): Promise<void>;
}
