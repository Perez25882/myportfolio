/** Grouped from stacks verified in the repositories (Phase 0 §1.1–1.3). */
export const capabilities: readonly { readonly group: string; readonly items: readonly string[] }[] = [
  { group: "Backend", items: ["TypeScript", "Node.js", "Fastify", "Express", "BullMQ", "Prisma"] },
  { group: "Data", items: ["Postgres", "Row-level security", "Supabase", "Redis"] },
  { group: "Frontend", items: ["React", "Next.js", "Vite", "TanStack Query", "Tailwind"] },
  { group: "Mobile", items: ["Flutter", "Expo / React Native"] },
  { group: "3D and realtime", items: ["Three.js", "GLB pipelines", "WebSockets"] },
  { group: "Product systems", items: ["Payments (Paystack, mobile money)", "AI with guardrails", "Security reviews"] },
];
