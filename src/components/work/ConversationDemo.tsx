"use client";

import { useState } from "react";
import { flowdeskCaseStudy } from "@/content/flowdesk";
import { currentStep, messagesAt, nextStep, recordAt, recordRows } from "@/museum/demo";
import styles from "./demo.module.css";

/**
 * The FlowDesk demonstration in 2D: the same script as the museum's, with its own state, so the
 * case study works without WebGL and doesn't move the 3D tour.
 */
export function ConversationDemo() {
  const [progress, setProgress] = useState(0);
  const messages = messagesAt(progress);
  const step = currentStep(progress);
  const upcoming = nextStep(progress);
  const rows = progress > 0 ? recordRows(recordAt(progress)) : [];

  return (
    <div className={styles.demo}>
      <p className={styles.notice}>
        <span className={styles.badge}>Simulation</span>
        Scripted from FlowDesk&apos;s verified behaviour. Not a live WhatsApp connection, and not real customer data.
      </p>

      <div className={styles.stage}>
        <div className={styles.phone}>
          <p className={styles.phoneHead}>Customer</p>
          <ol className={styles.chat} aria-label="Conversation" aria-live="polite">
            {messages.length === 0 ? <li className={styles.empty}>Send the first message to start.</li> : null}
            {messages.map((message) => (
              <li key={message.text} className={message.from === "customer" ? styles.customer : styles.shop}>
                <span className="visually-hidden">{message.from === "customer" ? "Customer: " : "Shop: "}</span>
                {message.text}
              </li>
            ))}
          </ol>
          <div className={styles.controls}>
            {upcoming ? (
              <button type="button" className={styles.send} onClick={() => setProgress((value) => value + 1)}>
                {upcoming.action}
              </button>
            ) : (
              <button type="button" className={styles.again} onClick={() => setProgress(0)}>
                Play again
              </button>
            )}
          </div>
        </div>

        <div className={styles.inside}>
          <h3 className={styles.insideTitle}>What FlowDesk did</h3>
          <p className={styles.note}>{step ? step.note : "Nothing yet. Each message you send shows up here."}</p>
          <ul className={styles.layers} aria-label="Layers involved">
            {flowdeskCaseStudy.strata.map((layer) => {
              const active = step ? (step.layers as readonly string[]).includes(layer.id) : false;
              return (
                <li key={layer.id} data-active={active}>
                  {layer.title}
                  {active ? <span className="visually-hidden"> (involved)</span> : null}
                </li>
              );
            })}
          </ul>
          {rows.length > 0 ? (
            <section className={styles.record} aria-labelledby="demo-record-title">
              <h3 id="demo-record-title" className={styles.insideTitle}>
                Order record
              </h3>
              <dl>
                {rows.map(([term, value]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
