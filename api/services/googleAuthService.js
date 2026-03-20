function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function verifyGoogleIdToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!idToken) {
    throw new Error('Google token is required');
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) {
    throw new Error(`Google token verification failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error_description || payload.error) {
    throw new Error(payload.error_description || payload.error);
  }

  if (clientId && payload.aud !== clientId) {
    throw new Error('Google token audience mismatch');
  }

  if (!payload.email || payload.email_verified !== 'true') {
    throw new Error('Google account email is not verified');
  }

  return {
    googleId: payload.sub,
    email: normalizeEmail(payload.email),
    name: payload.name || payload.given_name || payload.email,
    picture: payload.picture || null,
  };
}

module.exports = {
  verifyGoogleIdToken,
};
