/**
 * FlowDesk case study and exhibit strata. Module names were read from the
 * FlowDesk repository on 2026-10-27 (design/phase-1/03-exhibit-design-bible.md §1).
 */

export interface Stratum {
  readonly id: string;
  readonly title: string;
  readonly plain: string;
  readonly technical: string;
}

export const flowdeskCaseStudy = {
  problem:
    "Many shops in Ghana sell over WhatsApp. Orders, haggling and payment proof live inside chat threads, so they are easy to lose.",
  answer:
    "FlowDesk turns those chats into tracked orders, confirmed payments and a booking diary. The customer installs nothing and keeps messaging the same number.",
  statusNote:
    "Pre-launch. It runs locally against Meta's WhatsApp test number. No production users, customers or revenue are claimed.",
  thesis: "The price floor lives in the database, not the prompt.",
  strata: [
    {
      id: "intake",
      title: "Intake",
      plain: "Every WhatsApp message arrives at FlowDesk's front door.",
      technical: "Meta webhook into a Fastify route (modules/webhook).",
    },
    {
      id: "queue",
      title: "Queue",
      plain: "Messages wait in line so none are lost, even when the shop is busy.",
      technical:
        "BullMQ on Redis: queues/message, a message-processor worker, a dead-letter worker and tenant-fairness scheduling.",
    },
    {
      id: "understanding",
      title: "Understanding",
      plain: "FlowDesk works out what the customer wants.",
      technical: "services/intent: a rule engine first, then a pluggable AI classifier worker.",
    },
    {
      id: "grounding",
      title: "Grounding",
      plain: "Answers come only from the shop's real catalogue and prices.",
      technical: "services/assistant: context builder, evidence including priceFloors, grounding and decision.",
    },
    {
      id: "guardrails",
      title: "Guardrails",
      plain: "The assistant can't be talked below the shop's price, or tricked by hostile messages.",
      technical: "A negotiation gate on the database floor, a nonce-fenced prompt with a sanitiser, and a quantity ceiling.",
    },
    {
      id: "money",
      title: "Money",
      plain: "Payments are tracked by how certain they are, not just yes or no.",
      technical: "A payment confidence ladder (attest / void), a mobile-money screenshot review queue, and Paystack billing.",
    },
    {
      id: "shop-view",
      title: "The shop's view",
      plain: "The owner sees orders appear live on a board.",
      technical:
        "React and TanStack Query dashboard with role-scoped live updates over SSE; replies go out through queues/outbound and the WhatsApp Cloud API.",
    },
  ] satisfies readonly Stratum[],
} as const;
