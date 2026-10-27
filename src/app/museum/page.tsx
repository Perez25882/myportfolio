import type { Metadata } from "next";
import { MuseumGate } from "@/components/MuseumGate";

export const metadata: Metadata = {
  title: "The Museum",
  description: "A guided 3D tour: the Court and the FlowDesk room, with a scripted FlowDesk demonstration.",
};

export default function MuseumPage() {
  return <MuseumGate />;
}
