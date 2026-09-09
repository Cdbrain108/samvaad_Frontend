import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Firebase configuration with environment variables and project defaults
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim() || 'AIzaSyAa2MPLyrxxiYS6in7Ojv_jVmlzglwXXGw',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim() || 'samvaad-ai-db3a1.firebaseapp.com',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim() || 'samvaad-ai-db3a1',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim() || 'samvaad-ai-db3a1.firebasestorage.app',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim() || '293750023914',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim() || '1:293750023914:web:753705201ae0bfd07e9993'
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  typeof firebaseConfig.apiKey === 'string' &&
  !firebaseConfig.apiKey.includes('your_') &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('your_')
);

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn('Firebase initialization failed, running in guest/offline mode:', err);
    auth = null;
    db = null;
    googleProvider = null;
  }
} else {
  console.info('Firebase not configured. Running in local guest/standalone mode.');
}

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
  if (!auth) {
    return { user: null, error: 'Firebase authentication is not configured in this deployment.' };
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: getFriendlyErrorMessage(error) };
  }
};

export const loginUser = async (email, password) => {
  if (!auth) {
    return { user: null, error: 'Firebase authentication is not configured in this deployment.' };
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: getFriendlyErrorMessage(error) };
  }
};

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    return { user: null, error: 'Google sign-in is not configured in this deployment.' };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: getFriendlyErrorMessage(error) };
  }
};

export const logoutUser = async () => {
  if (!auth) {
    return { error: null };
  }
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  if (!auth) {
    // Gracefully inform listener that no remote user is logged in
    setTimeout(() => callback(null), 0);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Chat history functions
export const saveConversation = async (userId, conversation) => {
  if (!db) {
    // Local fallback for guest session
    return { id: `local_${Date.now()}`, error: null };
  }
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
  if (!db) {
    return { conversations: [], error: null };
  }
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
  if (!db) {
    return { conversation: null, error: 'Conversation not found' };
  }
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
  if (!db) {
    return { error: null };
  }
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
  if (!db) {
    return { error: null };
  }
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
  const defaultMemory = {
    updatedAt: new Date(),
    topics_explored: [],
    preferences: [],
    key_traits: [],
    unresolved_questions: [],
    summary: 'New user starting their spiritual and learning journey.'
  };

  if (!db) {
    try {
      const stored = localStorage.getItem(`samvaad_mem_${userId}`);
      return { memory: stored ? JSON.parse(stored) : defaultMemory, error: null };
    } catch {
      return { memory: defaultMemory, error: null };
    }
  }

  try {
    const memoryRef = doc(db, 'users', userId, 'profile', 'memory');
    const docSnap = await getDoc(memoryRef);
    if (docSnap.exists()) {
      return { memory: docSnap.data(), error: null };
    } else {
      await setDoc(memoryRef, defaultMemory);
      return { memory: defaultMemory, error: null };
    }
  } catch (error) {
    return { memory: null, error: error.message };
  }
};

export const saveUserMemory = async (userId, memoryData) => {
  if (!db) {
    try {
      localStorage.setItem(`samvaad_mem_${userId}`, JSON.stringify(memoryData));
    } catch {}
    return { error: null };
  }
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
  if (!db) {
    try {
      const stored = localStorage.getItem(`samvaad_prof_${userId}`);
      return { profile: stored ? JSON.parse(stored) : null, error: null };
    } catch {
      return { profile: null, error: null };
    }
  }
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
  if (!db) {
    try {
      localStorage.setItem(`samvaad_prof_${userId}`, JSON.stringify(profileData));
    } catch {}
    return { error: null };
  }
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