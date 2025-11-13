/**
 * Firebase Server Authentication
 *
 * Backend authentication token verification and user management
 */

import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import * as admin from 'firebase-admin';
import { getLogger } from '@classic-games/logger';

let adminApp: admin.app.App | null = null;

interface FirebaseAdminConfig {
  projectId: string;
  private_key: string;
  client_email: string;
}

/**
 * Initialize Firebase Admin SDK
 */
export function initializeFirebaseAdmin(config: FirebaseAdminConfig): admin.app.App {
  if (adminApp) {
    return adminApp;
  }

  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        privateKey: config.private_key.replace(/\\n/g, '\n'),
        clientEmail: config.client_email,
      }),
    });

    getLogger().info('Firebase Admin SDK initialized');
    return adminApp;
  } catch (error) {
    getLogger().fatal('Failed to initialize Firebase Admin SDK', error);
    throw error;
  }
}

/**
 * Get Firebase Admin auth instance
 */
export function getAdminAuth(): admin.auth.Auth {
  if (!adminApp) {
    adminApp = getApp() as admin.app.App;
  }
  return admin.auth(adminApp);
}

/**
 * Verify ID token
 */
export async function verifyIdToken(
  token: string
): Promise<admin.auth.DecodedIdToken> {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error: any) {
    getLogger().warn('Token verification failed', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
  try {
    const auth = getAdminAuth();
    const user = await auth.getUser(uid);
    return user;
  } catch (error) {
    getLogger().error('Failed to get user', error, { uid });
    throw error;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
  try {
    const auth = getAdminAuth();
    const user = await auth.getUserByEmail(email);
    return user;
  } catch (error) {
    getLogger().error('Failed to get user by email', error, { email });
    throw error;
  }
}

/**
 * Create user
 */
export async function createUser(
  email: string,
  password: string,
  displayName?: string
): Promise<admin.auth.UserRecord> {
  try {
    const auth = getAdminAuth();
    const user = await auth.createUser({
      email,
      password,
      displayName,
    });
    getLogger().info('User created', { uid: user.uid, email });
    return user;
  } catch (error: any) {
    getLogger().error('Failed to create user', error, { email });
    throw error;
  }
}

/**
 * Update user
 */
export async function updateUser(
  uid: string,
  updates: admin.auth.UpdateRequest
): Promise<admin.auth.UserRecord> {
  try {
    const auth = getAdminAuth();
    const user = await auth.updateUser(uid, updates);
    getLogger().info('User updated', { uid });
    return user;
  } catch (error) {
    getLogger().error('Failed to update user', error, { uid });
    throw error;
  }
}

/**
 * Delete user
 */
export async function deleteUser(uid: string): Promise<void> {
  try {
    const auth = getAdminAuth();
    await auth.deleteUser(uid);
    getLogger().info('User deleted', { uid });
  } catch (error) {
    getLogger().error('Failed to delete user', error, { uid });
    throw error;
  }
}

/**
 * Set custom claims
 */
export async function setCustomClaims(
  uid: string,
  claims: Record<string, unknown>
): Promise<void> {
  try {
    const auth = getAdminAuth();
    await auth.setCustomUserClaims(uid, claims);
    getLogger().info('Custom claims set', { uid });
  } catch (error) {
    getLogger().error('Failed to set custom claims', error, { uid });
    throw error;
  }
}

/**
 * Generate password reset link
 */
export async function generatePasswordResetLink(email: string): Promise<string> {
  try {
    const auth = getAdminAuth();
    const link = await auth.generatePasswordResetLink(email);
    getLogger().info('Password reset link generated', { email });
    return link;
  } catch (error) {
    getLogger().error('Failed to generate password reset link', error, { email });
    throw error;
  }
}

/**
 * Generate sign-in link
 */
export async function generateSignInLink(email: string): Promise<string> {
  try {
    const auth = getAdminAuth();
    const link = await auth.generateSignInWithEmailLink(email, {
      url: process.env.APP_URL || 'http://localhost:3000',
      handleCodeInApp: true,
    });
    getLogger().info('Sign-in link generated', { email });
    return link;
  } catch (error) {
    getLogger().error('Failed to generate sign-in link', error, { email });
    throw error;
  }
}

/**
 * Revoke user tokens
 */
export async function revokeTokens(uid: string): Promise<void> {
  try {
    const auth = getAdminAuth();
    await auth.revokeRefreshTokens(uid);
    getLogger().info('User tokens revoked', { uid });
  } catch (error) {
    getLogger().error('Failed to revoke tokens', error, { uid });
    throw error;
  }
}

/**
 * List users
 */
export async function listUsers(maxResults: number = 1000): Promise<admin.auth.GetUsersResult> {
  try {
    const auth = getAdminAuth();
    const result = await auth.listUsers(maxResults);
    return result;
  } catch (error) {
    getLogger().error('Failed to list users', error);
    throw error;
  }
}

/**
 * Delete multiple users
 */
export async function deleteUsers(uids: string[]): Promise<admin.auth.DeleteUsersResult> {
  try {
    const auth = getAdminAuth();
    const result = await auth.deleteUsers(uids);
    getLogger().info('Users deleted', { count: result.successCount });
    return result;
  } catch (error) {
    getLogger().error('Failed to delete users', error);
    throw error;
  }
}
