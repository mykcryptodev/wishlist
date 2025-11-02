# Wishlist Directory Feature

## Overview

Added a comprehensive wishlist directory feature that allows users to browse all wishlists on the platform with social profile integration powered by **Thirdweb TypeScript SDK**.

## Architecture

This implementation uses Thirdweb's `AccountProvider` component to fetch and display social profile data **client-side**, providing automatic profile resolution including avatars, display names, and wallet addresses. This is more efficient than server-side fetching and leverages Thirdweb's optimized caching and data resolution.

## Changes Made

### 1. Shared Utility for Wishlist Fetching

**File:** `src/lib/wishlist-utils.ts` (NEW)

- Created `getWishlistAddresses()` function that fetches all wishlist addresses from the contract
- Includes Redis caching with 1-hour TTL
- Handles both `.data` and `.result` formats from Thirdweb API responses
- Shared across multiple components to avoid code duplication

### 2. API Endpoint for Wishlist Addresses

**File:** `src/app/api/wishlists/addresses/route.ts` (NEW)

- `GET /api/wishlists/addresses` endpoint
- Fetches all wishlist addresses from the contract (via shared utility)
- Returns simple array of addresses
- Lightweight endpoint - profile data is fetched client-side by Thirdweb SDK
- Leverages existing Redis caching (1-hour TTL) from shared utility

### 3. Wishlist Directory Component

**File:** `src/components/wishlist/wishlist-directory.tsx` (NEW)

A reusable React component for displaying wishlists using Thirdweb SDK:

**Features:**

- Grid layout (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- Loading skeletons during data fetch
- Error handling with user-friendly messages
- **Thirdweb `AccountProvider` integration** for automatic profile resolution
- **`AccountAvatar`** component displays user profile pictures with fallback
- **`AccountName`** component shows resolved display names (from any linked auth method)
- **`AccountAddress`** component displays formatted wallet addresses
- Clickable cards that navigate to individual wishlists
- Automatic fallback to wallet address when no profile exists
- Optional "View all" link when using `maxItems` prop

**Components Used:**

- `AccountProvider`: Wraps each card to provide account context
- `AccountAvatar`: Shows profile picture or fallback icon
- `AccountName`: Displays name from any linked social account (Google, Apple, Email, etc.)
- `AccountAddress`: Shows truncated wallet address

**Props:**

- `title`: Section title (default: "Browse Wishlists")
- `description`: Section description
- `maxItems`: Limit displayed wishlists (shows "View all" link if exceeded)
- `showAll`: Boolean to control "View all" link display

**Child Component:**

- `WishlistCard`: Individual card component wrapped in `AccountProvider`

### 4. Homepage Updates

**File:** `src/app/page.tsx`

- Added new "Explore Wishlists" section after existing features
- Displays up to 6 wishlists on homepage
- Includes link to view all wishlists on `/users` page
- Maintains existing hero and features sections

### 5. Users Page Enhancement

**File:** `src/app/users/page.tsx`

- Converted to tabbed interface using shadcn/ui Tabs component
- **Tab 1: "Search Users"** - Farcaster user search (existing functionality)
- **Tab 2: "All Wishlists"** - Browse all wishlists with profiles
- Updated page title to "Discover Wishlists"
- Maintains haptic feedback on tab switches

### 6. User Search Route Refactoring

**File:** `src/app/api/users/search/route.ts`

- Removed duplicate `getWishlistAddresses()` function
- Now imports shared utility from `@/lib/wishlist-utils`
- Cleaner code with reduced duplication

## Technical Details

### Caching Strategy

- **Wishlist Addresses:** 1 hour TTL (data changes infrequently, cached in shared utility)
- **User Search:** 5 minutes TTL (user data changes more frequently)
- Profile data is handled by Thirdweb SDK's internal caching

### Thirdweb SDK Integration

This implementation leverages Thirdweb's TypeScript SDK v5 client-side components:

**Client Setup:**

- Uses `createThirdwebClient()` with client ID from `@/providers/Thirdweb`
- Client is shared across all `AccountProvider` instances

**Component Hierarchy:**

```jsx
<AccountProvider address={walletAddress} client={client}>
  <AccountAvatar /> {/* Shows profile picture */}
  <AccountName /> {/* Shows display name from any linked account */}
  <AccountAddress /> {/* Shows formatted wallet address */}
</AccountProvider>
```

**Automatic Profile Resolution:**
Thirdweb's `AccountProvider` automatically:

- Fetches profile data for the wallet address
- Resolves display names from linked accounts (Google, Apple, Facebook, Discord, Email, Phone, SIWE)
- Provides profile pictures/avatars
- Handles caching and error states
- Falls back gracefully when no profile exists

**Benefits of Client-Side Approach:**

- Reduced server load (no need to fetch profiles for all wallets)
- Better performance (Thirdweb's optimized data fetching)
- Automatic updates when profiles change
- Built-in caching by Thirdweb SDK
- Simpler API endpoints (just return addresses)

## User Experience

### Homepage Flow

1. User lands on homepage
2. Sees featured wishlists (6 max) with profiles automatically loaded by Thirdweb SDK
3. Profile pictures and names load asynchronously as they become visible
4. Can click any wishlist card to view details
5. "View all wishlists" link navigates to `/users` page

### Users Page Flow

1. User navigates to `/users`
2. Can search for specific Farcaster users (Tab 1)
3. Can browse all wishlists on platform (Tab 2)
4. Each wishlist card shows:
   - Profile avatar (from Thirdweb accounts)
   - Display name from any linked social account
   - Truncated wallet address
   - Automatically fetched via Thirdweb SDK
5. Click any card to view full wishlist

## Performance Optimizations

- Redis caching for wishlist addresses (1-hour TTL)
- Client-side profile fetching via Thirdweb SDK (reduces server load)
- Thirdweb's built-in caching for profile data
- Skeleton loading states for better UX
- Lazy loading of profile data (only loaded when visible)

## Files Created/Modified

**Created:**

- `src/lib/wishlist-utils.ts` - Shared utility for fetching wishlist addresses
- `src/app/api/wishlists/addresses/route.ts` - Simple endpoint returning addresses
- `src/components/wishlist/wishlist-directory.tsx` - Directory component with Thirdweb SDK

**Modified:**

- `src/app/page.tsx` - Added directory section
- `src/app/users/page.tsx` - Added tabs with directory view
- `src/app/api/users/search/route.ts` - Refactored to use shared utility
- `src/lib/redis.ts` - No changes needed (uses existing cache keys)

**Removed:**

- `src/app/api/wishlists/all/route.ts` - Old server-side profile fetching endpoint (replaced by client-side SDK approach)

## Future Enhancements (Suggestions)

- Sort by wishlist activity/creation date
- Search within wishlist directory
- Wishlist preview on hover (item count, recent items)
- Social sharing directly from directory
- Filter/group by profile type (social vs wallet-only)
- Pagination for very large lists
- Virtual scrolling for performance with 1000+ wishlists

## Migration Notes

This implementation uses Thirdweb's SDK components for better performance and maintainability. The approach:

1. **Server-side**: Only fetch wishlist addresses (lightweight)
2. **Client-side**: Let Thirdweb SDK handle profile resolution (optimized)

This reduces server load, simplifies the API, and provides a better user experience with Thirdweb's built-in caching and error handling.
