import type { StopId } from "./stops";

/**
 * The scripted FlowDesk demonstration. Deterministic, and clearly a simulation:
 * the product, prices and messages are illustrative. Each step only shows
 * behaviour verified in the FlowDesk code (Phase 0 audit, re-read 2026-10-27):
 * - services/pricing/ladder.ts: the only prices that exist are list → promotion
 *   → bulk tier → floor; anything the model writes outside that set is refused.
 * - services/assistant/router.ts: "A price below the floor never goes out, in
 *   any mode"; orders go through order creation, where the owner sees them.
 * - payments: a confidence ladder, so a payment stays unconfirmed until checked.
 */

export type LayerId = "intake" | "queue" | "understanding" | "grounding" | "guardrails" | "money" | "shop-view";

export interface OrderRecord {
  readonly item?: string;
  readonly quantity?: number;
  readonly unitPrice?: number;
  readonly offered?: number;
  readonly ladder?: readonly number[];
  readonly verdict?: string;
  readonly order?: string;
  readonly payment?: string;
}

export interface DemoStep {
  readonly id: string;
  /** Label for the button that plays this step. */
  readonly action: string;
  readonly customer?: string;
  readonly shop?: string;
  readonly layers: readonly LayerId[];
  /** What FlowDesk did, in plain words. */
  readonly note: string;
  readonly record: OrderRecord;
  /** Camera stop to move to when this step plays. */
  readonly stop?: StopId;
}

export const PRODUCT = "Wax print, half piece (6 yards)";
const LIST_PRICE = 250;
const FLOOR_PRICE = 230;
const OFFER = 200;

export const DEMO_STEPS: readonly DemoStep[] = [
  {
    id: "enquiry",
    action: "Send: “Do you have the wax print, half piece? I need two.”",
    customer: "Good morning. Do you have the wax print, half piece? I need two.",
    shop: `Good morning! Yes, we have it: GHS ${LIST_PRICE} each, GHS ${LIST_PRICE * 2} for two.`,
    layers: ["intake", "queue", "understanding", "grounding"],
    note: "FlowDesk matched the product in the shop's catalogue and replied only with its real price.",
    record: { item: PRODUCT, quantity: 2, unitPrice: LIST_PRICE },
  },
  {
    id: "offer",
    action: `Send: “Can you do GHS ${OFFER} each?”`,
    customer: `Can you do GHS ${OFFER} each?`,
    shop: `The best I can do is GHS ${FLOOR_PRICE} each, GHS ${FLOOR_PRICE * 2} for two.`,
    layers: ["understanding", "guardrails"],
    note: `GHS ${OFFER} is not on this item's price ladder (list GHS ${LIST_PRICE}, floor GHS ${FLOOR_PRICE}), so the server refuses it. The floor is stored in the database, not in the AI's instructions, so no wording can talk it lower.`,
    record: { offered: OFFER, ladder: [LIST_PRICE, FLOOR_PRICE], verdict: "Refused: below the floor", unitPrice: FLOOR_PRICE },
  },
  {
    id: "agreed",
    action: `Send: “Okay, ${FLOOR_PRICE * 2}. I'll pay with MoMo.”`,
    customer: `Okay, ${FLOOR_PRICE * 2}. I'll pay with MoMo.`,
    shop: "Thank you! Your order is recorded. We'll confirm as soon as your payment arrives.",
    layers: ["money", "shop-view"],
    note: "An order is a commitment, so it goes through order creation and appears on the owner's board. The payment stays unconfirmed until it is checked.",
    record: { order: "Recorded · on the owner's board", payment: "Unconfirmed until checked" },
    stop: "order",
  },
  {
    id: "beneath",
    action: "See how it works",
    layers: ["intake", "queue", "understanding", "grounding", "guardrails", "money", "shop-view"],
    note: "Seven layers handled that conversation. Each one is part of the real system.",
    record: {},
    stop: "beneath",
  },
];

/** Steps played so far: 0 means nothing has been sent yet. */
export type DemoProgress = number;

export function isComplete(progress: DemoProgress): boolean {
  return progress >= DEMO_STEPS.length;
}

export function nextStep(progress: DemoProgress): DemoStep | undefined {
  return DEMO_STEPS[progress];
}

export function currentStep(progress: DemoProgress): DemoStep | undefined {
  return progress > 0 ? DEMO_STEPS[progress - 1] : undefined;
}

export interface Message {
  readonly from: "customer" | "shop";
  readonly text: string;
}

export function messagesAt(progress: DemoProgress): readonly Message[] {
  return DEMO_STEPS.slice(0, progress).flatMap((step) => [
    ...(step.customer ? [{ from: "customer" as const, text: step.customer }] : []),
    ...(step.shop ? [{ from: "shop" as const, text: step.shop }] : []),
  ]);
}

/** The structured record after `progress` steps: each step's fields override earlier ones. */
export function recordAt(progress: DemoProgress): OrderRecord {
  return DEMO_STEPS.slice(0, progress).reduce<OrderRecord>((record, step) => ({ ...record, ...step.record }), {});
}

export function totalOf(record: OrderRecord): number | undefined {
  return record.quantity !== undefined && record.unitPrice !== undefined ? record.quantity * record.unitPrice : undefined;
}

/** The order slab appears on the ledger table once the order is recorded. */
export function orderRecorded(progress: DemoProgress): boolean {
  return recordAt(progress).order !== undefined;
}
