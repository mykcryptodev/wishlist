# SIWE Authentication Setup Instructions

## Environment Variables Required

Make sure your `.env.local` file has these variables:

```bash
# Your Thirdweb Secret Key (from dashboard)
THIRDWEB_SECRET_KEY=your_secret_key_here

# Your Admin Private Key (for signing SIWE payloads)
# This can be any wallet - it's used to sign the login messages
ADMIN_PRIVATE_KEY=0x...your_private_key...

# Your Thirdweb Client ID (public)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Optional: Your app URL (defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Get These Values

### 1. THIRDWEB_SECRET_KEY

1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Click on "Settings" → "API Keys"
3. Copy your **Secret Key** (keep this private!)

### 2. ADMIN_PRIVATE_KEY

This is a private key that will be used to sign the SIWE authentication messages. You have two options:

**Option A: Use your existing project wallet**

- Use the same private key you're using for your project wallet

**Option B: Create a new wallet just for auth**

- You can generate a new Ethereum wallet
- This wallet doesn't need any funds
- It's just used to sign authentication messages

To generate a new private key using Node.js:

```javascript
const { Wallet } = require("ethers");
const wallet = Wallet.createRandom();
console.log("Private Key:", wallet.privateKey);
console.log("Address:", wallet.address);
```

### 3. NEXT_PUBLIC_THIRDWEB_CLIENT_ID

1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Click on "Settings" → "API Keys"
3. Copy your **Client ID** (this is public and safe to expose)

## Testing the Setup

1. **Start your dev server:**

   ```bash
   npm run dev
   ```

2. **Try to sign in:**
   - Click the "Login" button
   - Connect your wallet
   - Sign the SIWE message when prompted
   - Check the browser console and terminal for logs

3. **Expected logs:**
   - Browser: `doLogin called with params:`
   - Server: `Login request received:`
   - Server: `Signature verified successfully: 0x...`

## Troubleshooting

### Error: "ADMIN_PRIVATE_KEY (private key) is required"

- Make sure you've added the `ADMIN_PRIVATE_KEY` to your `.env.local` file
- Restart your development server after adding the variable

### Error: "Invalid signature"

- Check that all environment variables are set correctly
- Make sure the domain in the SIWE message matches your app's domain
- Try clearing your browser's localStorage and signing in again

### Error: "RPC request failed with status 401"

- Verify your `THIRDWEB_SECRET_KEY` is correct
- Make sure it matches the key from your Thirdweb dashboard

## Security Notes

⚠️ **NEVER commit these files to git:**

- `.env.local`
- `.env`
- Any file containing private keys or secrets

✅ **These are safe to commit:**

- `env.example` (template without real values)
- Code that uses `process.env.VARIABLE_NAME`

The `.gitignore` file already excludes `.env.local` by default.
