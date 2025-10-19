# SIWE (Sign-In with Ethereum) Authentication

This document explains the SIWE authentication implementation in the Wishlist app.

## Overview

The app uses SIWE (Sign-In with Ethereum) to authenticate users. When users connect their wallet, they are prompted to sign a message to verify ownership. This creates a secure session that's used for all authenticated API requests.

## Architecture

### Frontend Components

#### 1. ConnectButton (src/components/navigation.tsx)

The main entry point for authentication. Features:

- Connects wallet using Thirdweb SDK
- Triggers SIWE authentication flow
- Stores auth token in localStorage
- Manages logout

#### 2. useAuthToken Hook (src/hooks/useAuthToken.ts)

React hook for managing authentication tokens:

```typescript
const { token, setToken, clearToken, isLoading } = useAuthToken();
```

- `token`: Current auth token (null if not authenticated)
- `setToken`: Store a new auth token
- `clearToken`: Remove auth token and logout
- `isLoading`: Loading state during token initialization

### Backend API Routes

#### GET /api/auth/login?address=<address>

Generate a login payload for the user to sign.

**Response:**

```json
{
  "payload": {
    "address": "0x...",
    "statement": "Sign in to Wishlist",
    "domain": "localhost:3000",
    "uri": "http://localhost:3000/api/auth/login",
    "version": "1",
    "chainId": "8453",
    "nonce": "random",
    "issuedAt": "2025-10-19T...",
    "expirationTime": "2025-10-20T..."
  }
}
```

#### POST /api/auth/login

Verify the signed message and create a session.

**Request:**

```json
{
  "payload": { ... },
  "signature": "0x..."
}
```

**Response:**

```json
{
  "success": true,
  "token": "base64_encoded_token",
  "address": "0x..."
}
```

#### POST /api/auth/logout

Clear the user's session.

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me

Check if the user is logged in.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "isLoggedIn": true,
  "address": "0x..."
}
```

### Authentication Utilities (src/lib/auth-utils.ts)

#### requireAuth(request: Request): Promise<string>

Require authentication for an API route. Throws an error if authentication fails.

```typescript
export async function requireAuth(request: Request): Promise<string> {
  // Tries Bearer token first, then falls back to x-wallet-address header
  // Returns wallet address in lowercase
}
```

#### optionalAuth(request: Request): Promise<string | null>

Optional authentication. Returns null if no authentication is provided.

```typescript
export async function optionalAuth(request: Request): Promise<string | null> {
  // Tries Bearer token first, then falls back to x-wallet-address header
  // Returns wallet address in lowercase or null
}
```

## Authentication Flow

### 1. User Connects Wallet

1. User clicks "Login" button
2. Wallet connection modal appears (Thirdweb ConnectButton)
3. User selects wallet (MetaMask, Coinbase, Email, etc.)
4. Wallet connects successfully

### 2. SIWE Authentication

1. After wallet connection, the `auth.getLoginPayload()` callback is triggered
2. Backend generates a unique payload with nonce and expiration
3. User signs the message in their wallet
4. `auth.doLogin()` sends the signed message to the backend
5. Backend verifies the signature using `verifySignature` from Thirdweb
6. If valid, backend creates a token and returns it
7. Token is stored in localStorage via `useAuthToken` hook

### 3. Making Authenticated Requests

Frontend components use the `useAuthToken` hook and send the token in the Authorization header:

```typescript
const { token } = useAuthToken();

await fetch("/api/exchanges", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### 4. Backend Verification

API routes use `requireAuth` or `optionalAuth` to verify the token:

```typescript
export async function GET(request: NextRequest) {
  const walletAddress = await requireAuth(request);
  // ... use walletAddress
}
```

The auth utilities:

1. Extract token from `Authorization: Bearer <token>` header
2. Decode and validate the token
3. Check if token is expired
4. Return the wallet address

### 5. Logout

1. User clicks logout (via Thirdweb's wallet details modal)
2. `auth.doLogout()` is called
3. Token is cleared from localStorage
4. Backend session is cleared (if needed)

## Token Format

Tokens are base64-encoded JSON objects:

```json
{
  "address": "0x...",
  "issuedAt": "2025-10-19T...",
  "expirationTime": "2025-10-20T..."
}
```

**Expiration:** 24 hours by default

## Security Considerations

1. **Token Storage:** Tokens are stored in localStorage, which persists across browser sessions but is vulnerable to XSS attacks. Consider using httpOnly cookies for production.

2. **Token Verification:** Tokens are verified on every request by checking:
   - Valid format (base64-encoded JSON)
   - Contains valid Ethereum address
   - Not expired

3. **Signature Verification:** The backend uses Thirdweb's `verifySignature` function to ensure the message was signed by the claimed wallet.

4. **Fallback Authentication:** The system supports a fallback `x-wallet-address` header for backward compatibility, but SIWE with Bearer tokens is preferred.

## Migration from x-wallet-address

The system supports both authentication methods:

1. **SIWE (Preferred):** `Authorization: Bearer <token>` header
2. **Fallback:** `x-wallet-address: <address>` header

The backend tries Bearer token first, then falls back to x-wallet-address. This ensures backward compatibility while encouraging migration to SIWE.

## Testing

To test the authentication flow:

1. Start the development server
2. Connect your wallet
3. Sign the SIWE message
4. Check browser localStorage for the `wishlist_auth_token` key
5. Make API requests and verify the token is sent in headers
6. Check browser console for any authentication errors

## Troubleshooting

### Token not being sent

- Check if `useAuthToken` hook is imported and used
- Verify token exists in localStorage: `localStorage.getItem('wishlist_auth_token')`
- Ensure component is wrapped in a client component (`'use client'`)

### Invalid token errors

- Token may be expired (24 hour expiration)
- Token format may be corrupted
- Try logging out and signing in again

### Signature verification fails

- Ensure Thirdweb client is properly configured
- Check that the wallet address matches the one that signed the message
- Verify the payload hasn't been modified

## Future Improvements

1. **Refresh Tokens:** Implement refresh tokens to avoid requiring users to sign every 24 hours
2. **HttpOnly Cookies:** Move tokens from localStorage to httpOnly cookies for better security
3. **Rate Limiting:** Add rate limiting to authentication endpoints
4. **Session Management:** Implement proper session management with database storage
5. **Multi-Device Support:** Allow users to manage sessions across multiple devices
