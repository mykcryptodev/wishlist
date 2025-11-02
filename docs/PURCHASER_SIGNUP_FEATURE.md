# Purchaser Signup Feature

## Overview

This feature allows users to sign up as purchasers for wishlist items, indicating their interest in buying specific items for someone else. The feature includes real-time purchaser counts, a dedicated dialog for managing purchasers, and seamless wallet integration.

## Components Created/Modified

### 1. New Component: `PurchasersDialog.tsx`

**Location:** `/src/components/wishlist/PurchasersDialog.tsx`

A comprehensive dialog component that displays and manages purchasers for a wishlist item.

**Features:**

- Shows all users who have signed up to purchase an item
- Displays user avatars and names using Thirdweb AccountProvider
- Allows non-owners to sign up or remove themselves as purchasers
- Shows signup timestamps
- Highlights the current user with a "You" badge
- Real-time transaction monitoring with loading states
- Owner vs. non-owner view modes

**Props:**

- `open` - Dialog open state
- `onOpenChange` - Callback for dialog state changes
- `itemId` - The wishlist item ID
- `itemTitle` - The item title for display
- `currentUserAddress` - Current user's wallet address (optional)
- `isOwner` - Whether the current user owns the item
- `onPurchaserChange` - Callback when purchaser list changes

### 2. Updated: `WishlistItemCard.tsx`

**Location:** `/src/components/wishlist/WishlistItemCard.tsx`

**Changes:**

- Added `purchaserCount` prop to display the number of interested purchasers
- Added `isUserPurchaser` prop to highlight items the user is purchasing
- Added a clickable badge showing purchaser count (opens purchasers dialog)
- Updated the "I'll Get This" button to show "You're Getting This" when user is signed up
- Visual feedback with different button variants based on user status

### 3. Updated: Public Wishlist Page

**Location:** `/src/app/wishlist/[address]/page.tsx`

**Changes:**

- Integrated `useActiveAccount` hook to get current user's wallet address
- Added purchaser data fetching for all items
- Implemented `handlePurchaseInterest` to open the purchasers dialog
- Added `handleViewPurchasers` to view purchaser list
- Added connect wallet banner for non-connected users
- Added `PurchasersDialog` component
- Auto-refreshes purchaser data when wallet connects/disconnects

**New Features:**

- Displays purchaser counts on each item card
- Shows if the current user is already a purchaser
- Prompts users to connect wallet before signing up
- Real-time updates when purchasers change

### 4. Updated: Owner Wishlist Page Components

**Location:** `/src/components/wishlist/WishlistItems.tsx`

**Changes:**

- Added purchaser count fetching for owner's items
- Implemented `handleViewPurchasers` to show purchaser dialog
- Added `handlePurchaserChange` to refresh counts after changes
- Integrated `PurchasersDialog` for owners to view who's interested
- Displays purchaser counts on item cards

## API Endpoints Used

The feature uses existing API endpoints:

1. **GET** `/api/wishlist/[itemId]/purchasers?itemId=<id>`
   - Fetches all purchasers for an item
   - Returns purchaser list and count

2. **POST** `/api/wishlist/[itemId]/purchasers`
   - Signs up a user as a purchaser
   - Body: `{ itemId, purchaserAddress }`
   - Returns transaction ID for monitoring

3. **DELETE** `/api/wishlist/[itemId]/purchasers?itemId=<id>&purchaserAddress=<address>`
   - Removes a user from purchasers
   - Returns transaction ID for monitoring

## User Flow

### For Public Viewers (Non-Owners)

1. **Without Wallet Connected:**
   - See a banner prompting to connect wallet
   - Can view items but cannot sign up as purchaser
   - Clicking "I'll Get This" shows error message

2. **With Wallet Connected:**
   - Click "I'll Get This" button on any item
   - Opens `PurchasersDialog` showing current purchasers
   - Click "I'll Get This Item" button in dialog
   - Transaction is submitted and monitored
   - Success toast shown when confirmed
   - Button changes to "You're Getting This"
   - Can remove themselves by opening dialog again

### For Wishlist Owners

1. View their own wishlist items with purchaser count badges
2. Click the purchaser count badge or Users icon
3. Opens `PurchasersDialog` in owner mode
4. See all users interested in purchasing each item
5. Cannot sign up as purchaser for their own items

## Technical Details

### State Management

- **Purchaser Data:** Fetched asynchronously for each item
- **Transaction Monitoring:** Uses `useTransactionMonitor` hook
- **Real-time Updates:** Auto-refreshes after successful transactions

### Wallet Integration

- Uses Thirdweb's `useActiveAccount` hook
- Integrates `ConnectButton` for wallet connection
- Uses `AccountProvider`, `AccountAvatar`, and `AccountName` for user display

### Smart Contract Integration

- Calls contract methods via API:
  - `signUpPurchaserForUser(itemId, purchaserAddress)`
  - `removePurchaserForUser(itemId, purchaserAddress)`
  - `getPurchasers(itemId)`
  - `getPurchaserCount(itemId)`

### UI/UX Features

1. **Visual Feedback:**
   - Loading states during transactions
   - Success/error toasts
   - Disabled buttons during processing
   - Badge highlighting on purchaser count

2. **Responsive Design:**
   - Mobile-friendly dialog
   - Adaptive grid layouts
   - Scrollable purchaser list for many users

3. **User Context:**
   - "You" badge on current user in purchaser list
   - Different button text when user is signed up
   - Owner vs. non-owner view modes

## Future Enhancements

Potential improvements for this feature:

1. **Notifications:** Alert item owners when someone signs up
2. **Coordination:** Allow purchasers to communicate or coordinate
3. **Purchase Status:** Mark items as "purchased" or "in progress"
4. **Budget Tracking:** Show how much each purchaser plans to spend
5. **Group Purchases:** Allow multiple purchasers to split cost
6. **Privacy Options:** Hide purchaser identities from each other

## Testing Checklist

- [ ] Connect wallet and sign up as purchaser
- [ ] View purchaser list as item owner
- [ ] Remove yourself as purchaser
- [ ] View purchasers without wallet connected
- [ ] Check transaction monitoring and toasts
- [ ] Verify purchaser counts update correctly
- [ ] Test on mobile devices
- [ ] Test with multiple purchasers
- [ ] Verify smart contract calls succeed
- [ ] Check error handling for failed transactions
