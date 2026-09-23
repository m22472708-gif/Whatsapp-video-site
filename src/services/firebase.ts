import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const initFirebase = (config: any) => {
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }
  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    return db;
  } catch (err) {
    console.warn('Firebase initialization note:', err);
    return null;
  }
};

export const getFirebaseDb = () => db;
