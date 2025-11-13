/**
 * @classic-games/auth
 *
 * Firebase authentication for Classic Games platform
 *
 * Client usage:
 * ```typescript
 * import { initializeFirebaseClient, signUp, signIn } from '@classic-games/auth/client';
 *
 * initializeFirebaseClient({
 *   apiKey: 'YOUR_API_KEY',
 *   authDomain: 'your-app.firebaseapp.com',
 *   // ...
 * });
 *
 * const user = await signUp('user@example.com', 'password');
 * ```
 *
 * Server usage:
 * ```typescript
 * import { initializeFirebaseAdmin, verifyIdToken } from '@classic-games/auth/server';
 *
 * initializeFirebaseAdmin({
 *   projectId: 'your-project',
 *   privateKey: 'YOUR_PRIVATE_KEY',
 *   clientEmail: 'firebase-adminsdk@your-project.iam.gserviceaccount.com',
 * });
 *
 * const token = await verifyIdToken(idToken);
 * ```
 *
 * Express middleware:
 * ```typescript
 * import { requireAuth } from '@classic-games/auth/middleware';
 *
 * app.post('/api/game-move', requireAuth, (req, res) => {
 *   console.log(`User ${req.user.uid} made a move`);
 * });
 * ```
 */

// Client exports
export {
  initializeFirebaseClient,
  getClientAuth,
  signUp,
  signIn,
  signOutUser,
  updateUserProfile,
  resetPassword,
  confirmPasswordResetWithCode,
  getCurrentUser,
  getAuthToken,
  onAuthChange,
  isAuthenticated,
  getUserId,
  getUserEmail,
} from './client';

// Server exports
export {
  initializeFirebaseAdmin,
  getAdminAuth,
  verifyIdToken,
  getUserByUid,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  setCustomClaims,
  generatePasswordResetLink,
  generateSignInLink,
  revokeTokens,
  listUsers,
  deleteUsers,
} from './server';

// Middleware exports
export {
  authMiddleware,
  verifyTokenMiddleware,
  requireAuth,
  requireRole,
  optionalAuth,
  authRateLimit,
  attachUserInfo,
  type AuthenticatedRequest,
} from './middleware';
