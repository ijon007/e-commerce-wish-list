"use client";

import { getFirestore, type Firestore } from "firebase/firestore";
import { app } from "./client";

let db: Firestore | undefined;

/** Browser-only singleton — avoids initializing Firestore during SSR. */
export function getDb(): Firestore {
  if (typeof window === "undefined") {
    throw new Error("getDb() must only run in the browser");
  }
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}
