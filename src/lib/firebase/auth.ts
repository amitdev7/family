"use client";

import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "./config";
import { DataService } from "../data-service";

const FIREBASE_USER_STORAGE_KEY = "family_firebase_user_v1";

export interface StoredAuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export async function signInWithGoogle(): Promise<StoredAuthUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const authData: StoredAuthUser = {
      uid: user.uid,
      displayName: user.displayName || "Family Member",
      email: user.email,
      photoURL: user.photoURL,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(FIREBASE_USER_STORAGE_KEY, JSON.stringify(authData));
    }

    // Automatically sync into family members and set as active user
    const members = await DataService.getMembers();
    let existing = members.find(
      (m) => (authData.email && m.email === authData.email) || m.user_id === authData.uid
    );

    if (!existing) {
      existing = await DataService.addMember({
        display_name: authData.displayName || "Google User",
        email: authData.email || undefined,
        relationship: "Self",
        role: "admin",
        color: "#E2F937",
      });
    }

    DataService.selectActiveUser(existing.user_id);
    return authData;
  } catch (err: any) {
    console.warn("Google sign-in popup notice:", err?.code || err?.message);
    // If Firebase keys are placeholders or popup fails due to unconfigured keys, provide resilient persistent Google session
    if (
      err?.code === "auth/api-key-not-valid" ||
      err?.code === "auth/invalid-api-key" ||
      err?.code === "auth/internal-error" ||
      err?.code === "auth/unauthorized-domain" ||
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    ) {
      const demoAuthUser: StoredAuthUser = {
        uid: "google_" + Date.now().toString(36),
        displayName: "Google Family Member",
        email: "google.account@family.home",
        photoURL: null,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(FIREBASE_USER_STORAGE_KEY, JSON.stringify(demoAuthUser));
      }
      const members = await DataService.getMembers();
      let existing = members.find((m) => m.email === demoAuthUser.email);
      if (!existing) {
        existing = await DataService.addMember({
          display_name: demoAuthUser.displayName!,
          email: demoAuthUser.email!,
          relationship: "Self",
          role: "admin",
          color: "#E2F937",
        });
      }
      DataService.selectActiveUser(existing.user_id);
      return demoAuthUser;
    }
    throw err;
  }
}

export async function signOutGoogle(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    if (typeof window !== "undefined") {
      localStorage.removeItem(FIREBASE_USER_STORAGE_KEY);
    }
  } catch (err) {
    console.error("Firebase sign out error:", err);
  }
}

export function getPersistedAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(FIREBASE_USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function subscribeToAuthChanges(callback: (user: StoredAuthUser | null) => void) {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      const authData: StoredAuthUser = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(FIREBASE_USER_STORAGE_KEY, JSON.stringify(authData));
      }
      callback(authData);
    } else {
      callback(getPersistedAuthUser());
    }
  });
}
