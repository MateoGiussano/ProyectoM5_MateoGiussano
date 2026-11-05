import type { Timestamp } from "firebase/firestore";

export function formatOrderDate(timestamp: Timestamp): string {
  return timestamp.toDate().toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
