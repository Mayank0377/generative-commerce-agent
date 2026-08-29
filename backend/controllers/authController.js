import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'shopagent_fallback_secret';

/**
 * Handles Google Sign-In: verifies Google credential token,
 * extracts user info, and returns a signed JWT.
 */
export async function googleSignIn(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential token.' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    // Sign our own JWT (valid for 7 days)
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    console.log(`[Auth] User signed in: ${user.name} (${user.email})`);

    res.json({ token, user });
  } catch (error) {
    console.error('[Auth] Google Sign-In error:', error.message);
    res.status(401).json({ error: 'Invalid Google credential.' });
  }
}
