import { describe, expect, it } from "vitest";
import { DEMO_STEPS, currentStep, isComplete, messagesAt, nextStep, orderRecorded, recordAt, totalOf } from "./demo";

describe("FlowDesk demonstration script", () => {
  it("starts with nothing sent", () => {
    expect(messagesAt(0)).toEqual([]);
    expect(recordAt(0)).toEqual({});
    expect(currentStep(0)).toBeUndefined();
    expect(nextStep(0)?.id).toBe("enquiry");
  });

  it("answers the enquiry with the catalogue price", () => {
    const record = recordAt(1);
    expect(messagesAt(1).map((message) => message.from)).toEqual(["customer", "shop"]);
    expect(record.unitPrice).toBe(250);
    expect(totalOf(record)).toBe(500);
  });

  it("refuses an offer below the floor and quotes only a price on the ladder", () => {
    const record = recordAt(2);
    const ladder = record.ladder ?? [];
    expect(record.offered).toBeLessThan(Math.min(...ladder));
    expect(record.verdict).toMatch(/Refused/);
    expect(ladder).toContain(record.unitPrice);
    expect(totalOf(record)).toBe(460);
  });

  it("records the order only once the customer agrees, with the payment unconfirmed", () => {
    expect(orderRecorded(2)).toBe(false);
    expect(orderRecorded(3)).toBe(true);
    expect(recordAt(3).payment).toMatch(/Unconfirmed/);
  });

  it("ends by showing every layer and reports completion", () => {
    expect(currentStep(DEMO_STEPS.length)?.layers).toHaveLength(7);
    expect(isComplete(DEMO_STEPS.length)).toBe(true);
    expect(isComplete(DEMO_STEPS.length - 1)).toBe(false);
  });

  it("leaves the total undefined until quantity and price are known", () => {
    expect(totalOf({ quantity: 2 })).toBeUndefined();
  });
});
