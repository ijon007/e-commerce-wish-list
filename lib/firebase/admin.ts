import 'server-only';
import firebase_admin, { ServiceAccount } from "firebase-admin";
//use in production
// import { applicationDefault } from "firebase-admin/app";
//remove in production
import sa from "@/lib/firebase/sa.json";

if (firebase_admin.apps.length == null || firebase_admin.apps.length == 0) {
  firebase_admin.initializeApp({
    //remove in production
    credential: firebase_admin.credential.cert(sa as ServiceAccount),
    //use in production
    // credential: applicationDefault(),
  });
} else {
  firebase_admin.app();
}

export const firestore = firebase_admin.firestore();
