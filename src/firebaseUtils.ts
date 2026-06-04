import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  getDocFromServer,
  deleteDoc
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { UserProfile, SaveSlot, WrongQuiz } from "./types";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

// Test DB Connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}
testConnection();

export async function signInWithGooglePopup(): Promise<any> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

// Custom Error Handling matching strict specs
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      email: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Collection CRUD Helpers
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const pathString = `users/${uid}`;
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathString);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const pathString = `users/${profile.uid}`;
  try {
    const docRef = doc(db, "users", profile.uid);
    await setDoc(docRef, profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathString);
  }
}

// Save Slots CRUD Helpers
export async function fetchUserSaves(uid: string): Promise<SaveSlot[]> {
  const pathString = "saves";
  try {
    const savesCol = collection(db, "saves");
    const q = query(savesCol, where("user_id", "==", uid));
    const snapshot = await getDocs(q);
    const savesList: SaveSlot[] = [];
    snapshot.forEach((d) => {
      savesList.push(d.data() as SaveSlot);
    });
    return savesList;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, pathString);
  }
}

export async function saveLectureSlot(slot: SaveSlot): Promise<void> {
  const pathString = `saves/${slot.id}`;
  if (!slot.user_id) {
    throw new Error("Missing user_id in save slot");
  }
  try {
    const docRef = doc(db, "saves", slot.id);
    await setDoc(docRef, slot);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathString);
  }
}

export async function deleteLectureSlot(id: string): Promise<void> {
  const pathString = `saves/${id}`;
  try {
    const docRef = doc(db, "saves", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, pathString);
  }
}

// Wrong Quizzes CRUD Helpers
export async function fetchWrongQuizzes(uid: string): Promise<WrongQuiz[]> {
  const pathString = "wrong_quizzes";
  try {
    const col = collection(db, "wrong_quizzes");
    const q = query(col, where("user_id", "==", uid));
    const snapshot = await getDocs(q);
    const list: WrongQuiz[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as WrongQuiz);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, pathString);
  }
}

export async function saveWrongQuiz(quiz: WrongQuiz): Promise<void> {
  const pathString = `wrong_quizzes/${quiz.id}`;
  if (!quiz.user_id) {
    throw new Error("Missing user_id in wrong quiz");
  }
  try {
    const docRef = doc(db, "wrong_quizzes", quiz.id);
    await setDoc(docRef, quiz);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathString);
  }
}

export async function deleteWrongQuiz(id: string): Promise<void> {
  const pathString = `wrong_quizzes/${id}`;
  try {
    const docRef = doc(db, "wrong_quizzes", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, pathString);
  }
}
