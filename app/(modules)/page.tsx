"use client";

import Navbar from "@/components/custom/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CATALOG, type CatalogProduct } from "@/lib/data/catalog";
import { getDb } from "@/lib/firebase/db";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/authProvider";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import LoadingIndicator from "@/components/custom/loading";

export interface WishListItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

function wishListItemFromFirestore(
  id: string,
  v: { name?: unknown; price?: unknown; image?: unknown; quantity?: unknown }
): WishListItem | null {
  if (
    typeof v.name !== "string" ||
    typeof v.price !== "number" ||
    typeof v.image !== "string"
  ) {
    return null;
  }
  let quantity = 1;
  if (typeof v.quantity === "number" && Number.isFinite(v.quantity)) {
    quantity = Math.max(1, Math.floor(v.quantity));
  }
  return { id, name: v.name, price: v.price, image: v.image, quantity };
}

function firestoreErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string"
  ) {
    const code = (err as { code: string }).code;
    if (code === "permission-denied") {
      return "Firestore blocked this (check rules and that you are signed in).";
    }
  }
  return fallback;
}

export default function ProductPage() {
  const { loading: authLoading } = useAuth();
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [wishListItems, setWishListItems] = useState<WishListItem[]>([]);
  const [wishListLoading, setWishListLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let unsubscribeItems: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeItems?.();
      unsubscribeItems = undefined;

      const uid = user?.uid ?? null;
      setFirebaseUid(uid);

      if (!user) {
        setWishListItems([]);
        setWishListLoading(false);
        return;
      }

      setWishListLoading(true);
      const db = getDb();
      const itemsRef = collection(db, "wishlists", user.uid, "items");
      unsubscribeItems = onSnapshot(
        itemsRef,
        (snapshot) => {
          const items: WishListItem[] = [];
          snapshot.forEach((docSnap) => {
            const parsed = wishListItemFromFirestore(
              docSnap.id,
              docSnap.data()
            );
            if (parsed) items.push(parsed);
          });
          items.sort((a, b) => a.name.localeCompare(b.name));
          setWishListItems(items);
          setWishListLoading(false);
        },
        (err) => {
          console.error(err);
          toast.error(firestoreErrorMessage(err, "Could not load wish list"));
          setWishListLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeItems?.();
    };
  }, []);

  const inWishList = useCallback(
    (productId: string) => wishListItems.some((w) => w.id === productId),
    [wishListItems]
  );

  const wishListTotalUnits = useMemo(
    () => wishListItems.reduce((sum, item) => sum + item.quantity, 0),
    [wishListItems]
  );

  async function handleAdd(product: CatalogProduct) {
    await auth.authStateReady();
    const uid = auth.currentUser?.uid;
    if (!uid) {
      toast.error("Sign in to add items.");
      return;
    }
    setMutatingId(product.id);
    try {
      const db = getDb();
      await setDoc(doc(db, "wishlists", uid, "items", product.id), {
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    } catch (err) {
      console.error(err);
      toast.error(
        firestoreErrorMessage(err, "Could not add to wish list")
      );
    } finally {
      setMutatingId(null);
    }
  }

  async function handleRemove(productId: string) {
    await auth.authStateReady();
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setMutatingId(productId);
    try {
      const db = getDb();
      await deleteDoc(doc(db, "wishlists", uid, "items", productId));
    } catch (err) {
      console.error(err);
      toast.error(firestoreErrorMessage(err, "Could not remove item"));
    } finally {
      setMutatingId(null);
    }
  }

  async function handleAdjustQuantity(productId: string, delta: number) {
    await auth.authStateReady();
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setMutatingId(productId);
    try {
      const db = getDb();
      const ref = doc(db, "wishlists", uid, "items", productId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const raw = snap.data().quantity;
      const current =
        typeof raw === "number" && Number.isFinite(raw)
          ? Math.max(1, Math.floor(raw))
          : 1;
      const next = current + delta;
      if (next < 1) {
        await deleteDoc(ref);
      } else {
        await updateDoc(ref, { quantity: next });
      }
    } catch (err) {
      console.error(err);
      toast.error(firestoreErrorMessage(err, "Could not update quantity"));
    } finally {
      setMutatingId(null);
    }
  }

  async function handleClear() {
    await auth.authStateReady();
    const uid = auth.currentUser?.uid;
    if (!uid || wishListItems.length === 0) return;
    setClearing(true);
    try {
      const db = getDb();
      const itemsRef = collection(db, "wishlists", uid, "items");
      const snapshot = await getDocs(itemsRef);
      const batch = writeBatch(db);
      snapshot.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (err) {
      console.error(err);
      toast.error(firestoreErrorMessage(err, "Could not clear wish list"));
    } finally {
      setClearing(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingIndicator loading className="size-8" loaderSize={32} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 space-y-2 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pit Lane Supply
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            F1 merch and grid essentials — build your wish list.
          </p>
        </header>
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/90">
              Paddock picks
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {CATALOG.map((product) => {
                const added = inWishList(product.id);
                const busy = mutatingId === product.id;
                return (
                  <Card key={product.id} className="overflow-hidden">
                    <CardHeader className="space-y-1 pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>
                        ${product.price.toFixed(2)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <img
                        src={product.image}
                        alt=""
                        width={400}
                        height={300}
                        className="aspect-4/3 w-full rounded-md object-cover"
                      />
                      <Button
                        className="w-full"
                        disabled={!firebaseUid || added || busy}
                        onClick={() => void handleAdd(product)}
                      >
                        <LoadingIndicator loading={busy} />
                        {added ? "In wish list" : "Add to Wish List"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section>
            <Card className="sticky top-6">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Wish list</CardTitle>
                <div className="flex items-center justify-between gap-2">
                  <CardDescription>
                    {wishListLoading
                      ? "Loading…"
                      : wishListItems.length === 0
                        ? "Nothing saved yet"
                        : `${wishListTotalUnits} item${wishListTotalUnits !== 1 ? "s" : ""} · ${wishListItems.length} product${wishListItems.length !== 1 ? "s" : ""}`}
                  </CardDescription>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={
                      wishListLoading ||
                      wishListItems.length === 0 ||
                      clearing
                    }
                    onClick={() => void handleClear()}
                  >
                    <LoadingIndicator loading={clearing} />
                    Clear Wish List
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Separator />
                {wishListLoading ? (
                  <div className="flex justify-center py-16">
                    <LoadingIndicator loading className="size-6" loaderSize={24} />
                  </div>
                ) : wishListItems.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No products in wish list
                  </p>
                ) : (
                  <ul className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto pr-1">
                    {wishListItems.map((item) => {
                      const busy = mutatingId === item.id;
                      return (
                        <li
                          key={item.id}
                          className="flex gap-3 rounded-md border border-border p-2"
                        >
                          <img
                            src={item.image}
                            alt=""
                            width={80}
                            height={80}
                            className="size-20 shrink-0 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)}
                              {item.quantity > 1 ? (
                                <span className="text-muted-foreground/80">
                                  {" "}
                                  × {item.quantity} · $
                                  {(item.price * item.quantity).toFixed(2)}
                                </span>
                              ) : null}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <div
                                className="inline-flex items-center rounded-md border border-border bg-muted/40"
                                role="group"
                                aria-label="Quantity"
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={busy || clearing}
                                  onClick={() =>
                                    void handleAdjustQuantity(item.id, -1)
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="size-3" />
                                </Button>
                                <span className="min-w-6 px-1 text-center text-xs tabular-nums text-muted-foreground">
                                  {item.quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  disabled={busy || clearing}
                                  onClick={() =>
                                    void handleAdjustQuantity(item.id, 1)
                                  }
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="size-3" />
                                </Button>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="shrink-0"
                                disabled={busy || clearing}
                                onClick={() => void handleRemove(item.id)}
                              >
                                <LoadingIndicator loading={busy} />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
