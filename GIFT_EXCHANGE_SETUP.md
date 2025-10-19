# Gift Exchange Feature Setup Guide

This guide will walk you through setting up the Gift Exchange feature, which allows users to create exchanges with their friends and family to coordinate gift giving without seeing random purchasers.

## Overview

The Gift Exchange feature provides:

- **Privacy for wishlist owners**: Owners cannot see who has signed up to purchase their items
- **Approved purchaser filtering**: Members of an exchange only see other exchange members who've signed up, not random people
- **Multi-exchange support**: Users can join multiple exchanges (Family, Work, Friends, etc.)

## Prerequisites

1. A Supabase account (free tier is sufficient)
2. Thirdweb account with API credentials
3. Node.js/Bun installed

## Step 1: Set Up Supabase

### 1.1 Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and fill in project details
4. Wait for the project to be created

### 1.2 Run the Database Migration

1. In your Supabase dashboard, go to the SQL Editor
2. Open the file `supabase-schema.sql` from the project root
3. Copy the entire contents
4. Paste into the SQL Editor in Supabase
5. Click "Run" to execute the migration

This will create:

- `exchanges` table for storing gift exchanges
- `exchange_memberships` table for tracking who's in each exchange
- Appropriate indexes for performance
- Row Level Security policies (optional, can be disabled)

### 1.3 Get Your Supabase Credentials

1. In your Supabase project dashboard, go to Project Settings > API
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (for client-side)
   - **service_role** key (for server-side, keep this secret!)

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local` if you haven't already:

   ```bash
   cp env.example .env.local
   ```

2. Add your Supabase credentials to `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Ensure your Thirdweb credentials are also configured:
   ```bash
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-client-id
   THIRDWEB_SECRET_KEY=your-secret-key
   THIRDWEB_PROJECT_WALLET=your-project-wallet-address
   ```

## Step 3: Install Dependencies

The required dependencies should already be installed from the setup, but if not:

```bash
bun install @supabase/supabase-js jose
```

## Step 4: Test the Setup

1. Start your development server:

   ```bash
   bun run dev
   ```

2. Navigate to `http://localhost:3000/exchanges`

3. Connect your wallet

4. Try creating a new exchange:
   - Click "Create Exchange"
   - Enter a name (e.g., "Smith Family")
   - Add an optional description
   - Click "Create Exchange"

5. You should see your exchange with an invite code

6. Test joining an exchange:
   - Open an incognito window or use a different wallet
   - Navigate to `/exchanges`
   - Click "Join Exchange"
   - Enter the invite code from step 5
   - You should successfully join the exchange

## Step 5: How It Works

### For Users

1. **Creating an Exchange**:
   - Go to `/exchanges`
   - Click "Create Exchange"
   - Share the invite code with family/friends

2. **Joining an Exchange**:
   - Go to `/exchanges`
   - Click "Join Exchange"
   - Enter the invite code you received

3. **Viewing Wishlists**:
   - When you view someone else's wishlist who is in your exchange
   - You'll only see purchasers from your exchange
   - Random people won't show up
   - Owners don't see any purchaser information

### Technical Flow

1. **Authentication**:
   - Uses Thirdweb's authentication system
   - JWT tokens are stored in localStorage
   - Tokens are sent with API requests via Authorization header

2. **Approved Purchaser Filtering**:
   - When fetching purchasers for an item:
     - If requester is the item owner → return empty array
     - If requester is in exchanges → filter to show only exchange members
     - If requester is not authenticated → show all purchasers

3. **Exchange Management**:
   - Exchanges are stored in Supabase
   - Each exchange has a unique 6-character invite code
   - Members can leave exchanges at any time
   - Empty exchanges are automatically deleted

## Troubleshooting

### "Database not configured" error

**Problem**: API routes return this error  
**Solution**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your `.env.local` file

### "Unauthorized" when accessing exchanges

**Problem**: User needs to authenticate with SIWE  
**Solution**: This will be implemented in a future update. For now, ensure the user's wallet is connected.

### Purchaser filtering not working

**Problem**: Seeing all purchasers instead of just exchange members  
**Solution**:

1. Check that you're logged in and have a valid auth token
2. Verify you're in at least one exchange
3. Check browser console for errors

### Invite code not working

**Problem**: "Invalid invite code" error  
**Solution**:

1. Double-check the code is exactly 6 characters
2. Codes are case-sensitive (uppercase)
3. Make sure the exchange hasn't been deleted

## Security Notes

1. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Only use it in server-side API routes.

2. **Row Level Security**: The schema includes RLS policies, but for simplicity, the application uses the service role key which bypasses RLS. You can enable RLS by:
   - Removing the service role key usage in API routes
   - Implementing proper JWT-based authentication with Supabase
   - Updating RLS policies to match your JWT claims

3. **Rate Limiting**: Consider adding rate limiting to the exchange creation endpoint to prevent abuse.

## API Endpoints

### Exchange Management

- `GET /api/exchanges` - List user's exchanges
- `POST /api/exchanges` - Create a new exchange
- `POST /api/exchanges/[id]/join` - Join an exchange with invite code
- `GET /api/exchanges/[id]/members` - Get members of an exchange
- `DELETE /api/exchanges/[id]/leave` - Leave an exchange

### Purchaser Filtering

- `GET /api/wishlist/[itemId]/purchasers` - Get purchasers for an item
  - Automatically filters based on authentication and exchange membership
  - Returns empty array if requester is the item owner

## Future Enhancements

1. **SIWE Authentication**: Proper Sign-In With Ethereum flow
2. **Exchange Roles**: Admin/member roles with different permissions
3. **Exchange Settings**: Configure visibility, notifications, etc.
4. **Notifications**: Notify exchange members when someone joins
5. **Exchange Invitations**: Direct wallet-to-wallet invitations

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the server logs for API errors
3. Verify all environment variables are set correctly
4. Ensure Supabase tables were created successfully
