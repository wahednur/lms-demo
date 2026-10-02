/** Fixed, short artificial latency for mock service calls — just enough to
 * exercise real loading states without slowing the demo down (brief §12). */
export function delay(ms = 280): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Plausible file size for a demo "uploaded" resource — isolated here
 * (rather than inline in a component) because calling Math.random()
 * directly inside component/render code violates the purity rule. */
export function randomFileSizeKb(): number {
  return 200 + Math.floor(Math.random() * 600);
}

export function newId(prefix: string): string {
  // Not cryptographically unique, but stable-enough for a client-only demo:
  // timestamp + a short random suffix avoids collisions within one session.
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)
    .toString(36)
    .padStart(2, "0")}`;
}
