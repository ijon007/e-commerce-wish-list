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
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingIndicator from "@/components/custom/loading";

export interface WishListItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

function wishListItemFromFirestore(
  id: string,
  v: { name?: unknown; price?: unknown; image?: unknown }
): WishListItem | null {
  if (
    typeof v.name !== "string" ||
    typeof v.price !== "number" ||
    typeof v.image !== "string"
  ) {
    return null;
  }
  return { id, name: v.name, price: v.price, image: v.image };
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
        <h1 className="mb-8 text-2xl font-semibold tracking-tight">
          Wish list shop
        </h1>
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <section>
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">
              Products
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
                      : `${wishListItems.length} saved`}
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
                          className="flex gap-3 rounded-md border border-border p-3"
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
                            </p>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="mt-2"
                              disabled={busy || clearing}
                              onClick={() => void handleRemove(item.id)}
                            >
                              <LoadingIndicator loading={busy} />
                              Remove
                            </Button>
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
