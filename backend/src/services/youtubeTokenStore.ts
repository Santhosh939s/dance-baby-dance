/**
 * YouTubeTokenStore
 * 
 * Abstract interface for storing user-specific YouTube OAuth tokens.
 * Currently uses an in-memory map, but is designed to be easily swapped 
 * with Firestore (via Admin SDK) or a secure key vault later.
 */

interface OAuthTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
}

// In-memory store for Phase 4 validation.
const tokenStorage = new Map<string, OAuthTokens>();

export const saveUserTokens = async (uid: string, tokens: OAuthTokens): Promise<void> => {
  // If a refresh token already exists and isn't provided in the new payload, preserve it.
  const existing = tokenStorage.get(uid) || {};
  const newTokens = {
    ...existing,
    ...tokens,
    refresh_token: tokens.refresh_token || existing.refresh_token,
  };
  
  tokenStorage.set(uid, newTokens);
  console.log(`[TokenStore] Saved tokens for user ${uid}`);
};

export const getUserTokens = async (uid: string): Promise<OAuthTokens | null> => {
  return tokenStorage.get(uid) || null;
};

export const deleteUserTokens = async (uid: string): Promise<void> => {
  tokenStorage.delete(uid);
};

export const hasValidConnection = async (uid: string): Promise<boolean> => {
  const tokens = await getUserTokens(uid);
  return !!(tokens && tokens.refresh_token);
};
