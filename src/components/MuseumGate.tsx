"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { MuseumExperience } from "@/components/museum/MuseumExperience";
import { detectWebGL, type WebGLSupport } from "@/lib/webgl";
import styles from "./MuseumGate.module.css";

let cachedSupport: WebGLSupport | null = null;

function getSupport(): WebGLSupport {
  cachedSupport ??= detectWebGL();
  return cachedSupport;
}

const noopSubscribe = () => () => {};

/**
 * Entry to the 3D museum. Checks WebGL before anything heavy loads and sends
 * devices that can't render 3D to the Quick View with one sentence of explanation.
 */
export function MuseumGate() {
  const support = useSyncExternalStore<WebGLSupport | "checking">(noopSubscribe, getSupport, () => "checking");

  if (support === "checking") {
    return (
      <div className="page">
        <p className={styles.status} role="status">
          Checking this device…
        </p>
      </div>
    );
  }

  if (support === "none") {
    return (
      <div className="page">
        <div className={styles.panel} role="alert">
          <h1 className={styles.title}>The 2D portfolio instead</h1>
          <p>This device can&apos;t show the 3D museum, so here&apos;s everything at a glance.</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/quick">
              Open the portfolio
            </Link>
            <Link className={styles.secondary} href="/work/flowdesk">
              FlowDesk case study
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <MuseumExperience />;
}
