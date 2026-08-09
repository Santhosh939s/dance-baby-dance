import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { saveUserTokens, hasValidConnection } from '../services/youtubeTokenStore';

const router = express.Router();

// Initialize the OAuth2 client. We'll expect these in .env
// Note: We'll construct the client dynamically in routes if env vars aren't set yet,
// but for production, these should be set.
const getOAuthClient = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/oauth/google/callback'
  );
};

// GET /api/oauth/google?uid=...
router.get('/google', (req, res) => {
  const { uid } = req.query;
  
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'User ID (uid) is required' });
  }

  const client = getOAuthClient();
  
  const authUrl = client.generateAuthUrl({
    access_type: 'offline', // Required to get a refresh token
    scope: ['https://www.googleapis.com/auth/youtube.readonly'],
    prompt: 'consent', // Force consent screen to ensure we get a refresh token
    state: uid // Pass uid through the state parameter to recover it in callback
  });

  res.redirect(authUrl);
});

// GET /api/oauth/google/callback
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const uid = state as string;

  if (!code || !uid) {
    return res.status(400).send('Missing authorization code or state (uid)');
  }

  try {
    const client = getOAuthClient();
    // Exchange the authorization code for access & refresh tokens
    const { tokens } = await client.getToken(code as string);
    
    // Store tokens securely on the server
    await saveUserTokens(uid, tokens);

    // Redirect back to frontend dashboard with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard?youtube_connected=true`);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard?youtube_connected=false`);
  }
});

// GET /api/oauth/status?uid=...
router.get('/status', async (req, res) => {
  const { uid } = req.query;
  if (!uid || typeof uid !== 'string') return res.status(400).json({ connected: false });

  const connected = await hasValidConnection(uid);
  res.json({ connected });
});

export default router;
