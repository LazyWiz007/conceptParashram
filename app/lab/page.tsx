import { notFound } from "next/navigation";
import { AnchorAuthor } from "./AnchorAuthor";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Dev-only slot authoring tool. Off in production unless ENABLE_LAB is set —
 * it is unauthenticated, and a public page that lets anyone drag the sponsor
 * slots around is not something to ship by accident.
 */
export default function Lab() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_LAB !== "1") {
    notFound();
  }
  return <AnchorAuthor />;
}
