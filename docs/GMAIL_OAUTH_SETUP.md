# Gmail OAuth Setup

The app includes a working Gmail-ready draft workflow and internal API surfaces. Real Gmail sending requires external Google setup:

1. Create a Google Cloud project.
2. Configure OAuth consent screen.
3. Add Gmail API.
4. Create OAuth Client ID for a web app.
5. Add redirect URI:
   - Local: `http://localhost:3000/settings`
   - Production: `https://frontend-six-livid-36.vercel.app/settings`
6. Set backend/frontend environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
7. Request scopes:
   - `https://www.googleapis.com/auth/gmail.compose`
   - `https://www.googleapis.com/auth/gmail.send`

Until those credentials are configured, the app generates Gmail-ready drafts that users can copy into Gmail.
