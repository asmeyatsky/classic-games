/**
 * Firebase Client Authentication
 *
 * Frontend authentication for browser and React Native
 */

import {
  initializeApp,
  FirebaseApp,
  getApp,
} from 'firebase/app';
import {
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  onAuthStateChanged,
  connectAuthEmulator,
  getIdToken,
} from 'firebase/auth';
import { getLogger } from '@classic-games/logger';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Initialize Firebase client
 */
export function initializeFirebaseClient(config: FirebaseConfig): FirebaseApp {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    firebaseApp = initializeApp(config);
    auth = getAuth(firebaseApp);

    // Set persistence to localStorage
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      getLogger().warn('Failed to set persistence', error);
    });

    // Optional: connect to emulator in development
    if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_EMULATOR_HOST) {
      connectAuthEmulator(auth, `http://${process.env.FIREBASE_EMULATOR_HOST}`);
    }

    getLogger().info('Firebase client initialized');
    return firebaseApp;
  } catch (error) {
    getLogger().fatal('Failed to initialize Firebase client', error);
    throw error;
  }
}

/**
 * Get Firebase client auth instance
 */
export function getClientAuth(): Auth {
  if (!auth) {
    auth = getAuth(getApp());
  }
  return auth;
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string): Promise<User> {
  try {
    const auth = getClientAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    getLogger().info('User signed up', { userId: credential.user.uid, email });
    return credential.user;
  } catch (error: any) {
    getLogger().error('Sign up failed', error, { email });
    throw new Error(error.message || 'Sign up failed');
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const auth = getClientAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(credential.user);
    getLogger().info('User signed in', { userId: credential.user.uid, email });
    return credential.user;
  } catch (error: any) {
    getLogger().error('Sign in failed', error, { email });
    throw new Error(error.message || 'Sign in failed');
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    const auth = getClientAuth();
    await signOut(auth);
    getLogger().info('User signed out');
  } catch (error) {
    getLogger().error('Sign out failed', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  displayName: string,
  avatarUrl?: string
): Promise<void> {
  try {
    const auth = getClientAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('No user signed in');
    }

    await updateProfile(user, {
      displayName,
      photoURL: avatarUrl,
    });

    getLogger().info('User profile updated', { userId: user.uid, displayName });
  } catch (error) {
    getLogger().error('Profile update failed', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    const auth = getClientAuth();
    await sendPasswordResetEmail(auth, email);
    getLogger().info('Password reset email sent', { email });
  } catch (error: any) {
    getLogger().error('Password reset failed', error, { email });
    throw new Error(error.message || 'Failed to send reset email');
  }
}

/**
 * Confirm password reset with code and new password
 */
export async function confirmPasswordResetWithCode(
  code: string,
  newPassword: string
): Promise<void> {
  try {
    const auth = getClientAuth();
    await confirmPasswordReset(auth, code, newPassword);
    getLogger().info('Password reset confirmed');
  } catch (error: any) {
    getLogger().error('Password reset confirmation failed', error);
    throw new Error(error.message || 'Failed to reset password');
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const auth = getClientAuth();
  return auth.currentUser;
}

/**
 * Get ID token for authenticated requests
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const auth = getClientAuth();
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    return await getIdToken(user);
  } catch (error) {
    getLogger().error('Failed to get auth token', error);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getClientAuth();
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const auth = getClientAuth();
  return auth.currentUser !== null;
}

/**
 * Get user ID
 */
export function getUserId(): string | null {
  const auth = getClientAuth();
  return auth.currentUser?.uid || null;
}

/**
 * Get user email
 */
export function getUserEmail(): string | null {
  const auth = getClientAuth();
  return auth.currentUser?.email || null;
}
