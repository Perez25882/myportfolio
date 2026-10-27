"use client";

import { flowdeskCaseStudy } from "@/content/flowdesk";
import { currentStep, messagesAt, nextStep, recordAt, totalOf, type OrderRecord } from "@/museum/demo";
import { useMuseumStore } from "@/store/museum";
import styles from "./museum.module.css";

const ghs = (value: number) => `GHS ${value}`;

/** The scripted FlowDesk conversation, what FlowDesk did with each message, and the record it built. */
export function DemoPanel() {
  const progress = useMuseumStore((state) => state.demoProgress);
  const playDemoStep = useMuseumStore((state) => state.playDemoStep);
  const resetDemo = useMuseumStore((state) => state.resetDemo);
  const messages = messagesAt(progress);
  const step = currentStep(progress);
  const upcoming = nextStep(progress);

  return (
    <div className={styles.demo}>
      <p className={styles.simulation}>
        <span className={styles.badge}>Simulation</span>
        Scripted from FlowDesk&apos;s verified behaviour. Not a live WhatsApp connection, and not real customer data.
      </p>

      {messages.length > 0 ? (
        <ol className={styles.chat} aria-label="Conversation" aria-live="polite">
          {messages.map((message) => (
            <li key={message.text} className={message.from === "customer" ? styles.customer : styles.shop}>
              <span className="visually-hidden">{message.from === "customer" ? "Customer: " : "Shop: "}</span>
              {message.text}
            </li>
          ))}
        </ol>
      ) : null}

      {step ? (
        <div className={styles.what}>
          <p className={styles.label}>What FlowDesk did</p>
          <p>{step.note}</p>
          <ul className={styles.layers} aria-label="Layers involved">
            {flowdeskCaseStudy.strata.map((layer) => {
              const active = (step.layers as readonly string[]).includes(layer.id);
              return (
                <li key={layer.id} data-active={active}>
                  {layer.title}
                  {active ? <span className="visually-hidden"> (involved)</span> : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {progress > 0 ? <RecordCard record={recordAt(progress)} /> : null}

      <div className={styles.actions}>
        {upcoming ? (
          <button type="button" className={styles.primary} onClick={playDemoStep}>
            {upcoming.action}
          </button>
        ) : (
          <button type="button" className={styles.secondary} onClick={resetDemo}>
            Play again
          </button>
        )}
      </div>
    </div>
  );
}

function RecordCard({ record }: { readonly record: OrderRecord }) {
  const total = totalOf(record);
  const rows: [string, string | undefined][] = [
    ["Item", record.item],
    ["Quantity", record.quantity?.toString()],
    ["Unit price", record.unitPrice !== undefined ? ghs(record.unitPrice) : undefined],
    ["Total", total !== undefined ? ghs(total) : undefined],
    ["Offer", record.offered !== undefined ? `${ghs(record.offered)} each` : undefined],
    ["Price check", record.verdict && record.ladder ? `${record.verdict} (ladder: ${record.ladder.map(ghs).join(" → ")})` : undefined],
    ["Order", record.order],
    ["Payment", record.payment],
  ];

  return (
    <section className={styles.record} aria-labelledby="record-title">
      <h3 id="record-title" className={styles.label}>
        Order record
      </h3>
      <dl>
        {rows
          .filter(([, value]) => value !== undefined)
          .map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}
