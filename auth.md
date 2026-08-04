# Authentication & Agent Registration

This file explains how agents and integrators can authenticate with Aliasist APIs.

Endpoints:
- Authorization endpoint: https://aliasist.com/auth
- Token endpoint: https://aliasist.com/token
- JWKS: https://aliasist.com/.well-known/jwks.json

Suggested flows:
- For interactive agents: OAuth2 Authorization Code flow with PKCE.
- For server-to-server: OAuth2 Client Credentials.

Agent registration (manual):
1. Register an integration by contacting dev@aliasist.com with app name and redirect URIs.
2. Provide client_id and client_secret (or use dynamic client registration if supported).
3. Use the token endpoint to obtain access tokens; present tokens in Authorization: Bearer <token>.

For automated agent onboarding, consider implementing dynamic client registration and a /register endpoint.

