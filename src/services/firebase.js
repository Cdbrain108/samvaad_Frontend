import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate config
const missingKeys = Object.entries(firebaseConfig).filter(([, value]) => !value || value.includes('your_'));
if (missingKeys.length > 0) {
  console.warn('Firebase config incomplete. Please set environment variables in .env file.');
  console.warn('Missing:', missingKeys.map(([key]) => key).join(', '));
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Helper for friendly error messages
const getFriendlyErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  const code = error.code || '';
  switch (code) {
    case 'auth/configuration-not-found':
      return 'Sign-in method is disabled in your Firebase project. Please enable it in Firebase Console.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing sign in.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request cancelled.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};

// Authentication functions
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: getFriendlyErrorMessage(error) };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: getFriendlyErrorMessage(error) };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: getFriendlyErrorMessage(error) };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Chat history functions
export const saveConversation = async (userId, conversation) => {
  try {
    const conversationsRef = collection(db, 'users', userId, 'conversations');
    const docRef = await addDoc(conversationsRef, {
      ...conversation,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getUserConversations = async (userId, limitCount = 20) => {
  try {
    const conversationsRef = collection(db, 'users', userId, 'conversations');
    const q = query(conversationsRef, orderBy('updatedAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const conversations = [];
    querySnapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
    return { conversations, error: null };
  } catch (error) {
    console.warn('getUserConversations orderBy error, executing fallback query:', error);
    try {
      const conversationsRef = collection(db, 'users', userId, 'conversations');
      const fallbackSnap = await getDocs(conversationsRef);
      const conversations = [];
      fallbackSnap.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() });
      });
      return { conversations, error: null };
    } catch (fallbackErr) {
      return { conversations: [], error: fallbackErr.message };
    }
  }
};

export const getConversation = async (userId, conversationId) => {
  try {
    const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
    const docSnap = await getDoc(conversationRef);
    if (docSnap.exists()) {
      return { conversation: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { conversation: null, error: 'Conversation not found' };
    }
  } catch (error) {
    return { conversation: null, error: error.message };
  }
};

export const updateConversation = async (userId, conversationId, updates) => {
  try {
    const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
    await setDoc(conversationRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteConversation = async (userId, conversationId) => {
  try {
    const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
    await deleteDoc(conversationRef);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Long-term User Memory in Firestore
export const getUserMemory = async (userId) => {
  try {
    const memoryRef = doc(db, 'users', userId, 'profile', 'memory');
    const docSnap = await getDoc(memoryRef);
    if (docSnap.exists()) {
      return { memory: docSnap.data(), error: null };
    } else {
      const defaultMemory = {
        updatedAt: new Date(),
        topics_explored: [],
        preferences: [],
        key_traits: [],
        unresolved_questions: [],
        summary: 'New user starting their spiritual and learning journey.'
      };
      await setDoc(memoryRef, defaultMemory);
      return { memory: defaultMemory, error: null };
    }
  } catch (error) {
    return { memory: null, error: error.message };
  }
};

export const saveUserMemory = async (userId, memoryData) => {
  try {
    const memoryRef = doc(db, 'users', userId, 'profile', 'memory');
    await setDoc(memoryRef, {
      ...memoryData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// User Profile Info (Full Name & Age)
export const getUserProfileInfo = async (userId) => {
  try {
    const profileRef = doc(db, 'users', userId, 'profile', 'info');
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) {
      return { profile: docSnap.data(), error: null };
    }
    return { profile: null, error: null };
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

export const saveUserProfileInfo = async (userId, profileData) => {
  try {
    const profileRef = doc(db, 'users', userId, 'profile', 'info');
    await setDoc(profileRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export { auth, db };