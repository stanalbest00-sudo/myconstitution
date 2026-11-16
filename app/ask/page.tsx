import type { Metadata } from "next";
import { AskClient } from "./AskClient";

export const metadata: Metadata = { title: "Ask Constitution AI" };

export default function AskPage() {
  return <AskClient />;
}
