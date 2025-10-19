# Purchaser Signup Feature - Usage Guide

## Quick Start

### For Users Viewing Someone's Wishlist

1. **Connect Your Wallet**
   - Visit someone's wishlist page: `/wishlist/[address]`
   - Click "Connect Wallet" if you haven't already
   - Sign in with your preferred wallet provider

2. **Sign Up as a Purchaser**
   - Browse the wishlist items
   - Click the "I'll Get This" button on an item you want to buy
   - A dialog opens showing other interested purchasers
   - Click "I'll Get This Item" in the dialog
   - Wait for the transaction to confirm (you'll see a loading toast)
   - Success! The button now shows "You're Getting This"

3. **View Other Purchasers**
   - Click the badge with the user count (e.g., "👥 3") on any item
   - See everyone who's interested in purchasing that item
   - See when each person signed up

4. **Remove Yourself**
   - Click "You're Getting This" button or the purchaser count badge
   - Click "Remove Me from This Item" in the dialog
   - Wait for confirmation
   - You're no longer listed as a purchaser

### For Wishlist Owners

1. **View Interested Purchasers**
   - Go to your wishlist page: `/wishlist`
   - See purchaser count badges on items with interest
   - Click the badge or the "Users" icon button to view details

2. **See Who's Helping**
   - The dialog shows all users interested in each item
   - See their wallet addresses or social profiles
   - See when they signed up

## Visual Indicators

### Purchaser Count Badge

```
┌─────────────────┐
│  [Image]        │
│           [💰]  │ ← Price badge
│           [👥3] │ ← Purchaser count badge (clickable)
└─────────────────┘
```

### Button States

**Not Signed Up:**

```
┌────────────────────────────┐
│  🛒  I'll Get This         │ ← Outline button
└────────────────────────────┘
```

**Already Signed Up:**

```
┌────────────────────────────┐
│  👥  You're Getting This   │ ← Secondary/highlighted button
└────────────────────────────┘
```

**Processing:**

```
┌────────────────────────────┐
│  Processing...             │ ← Disabled button
└────────────────────────────┘
```

## Purchasers Dialog Layout

```
╔═══════════════════════════════════════╗
║  👥 Interested Purchasers             ║
║  People who want to get "Item" for you║
╟───────────────────────────────────────╢
║  [Action Button - Sign Up/Remove]     ║ ← Only for non-owners
╟───────────────────────────────────────╢
║  3 people interested                  ║
║                                       ║
║  ┌───────────────────────────────┐   ║
║  │ [👤] Alice Johnson  [You]     │   ║
║  │     Signed up Dec 15, 2:30 PM │   ║
║  └───────────────────────────────┘   ║
║                                       ║
║  ┌───────────────────────────────┐   ║
║  │ [👤] Bob Smith                │   ║
║  │     Signed up Dec 14, 5:15 PM │   ║
║  └───────────────────────────────┘   ║
║                                       ║
║  ┌───────────────────────────────┐   ║
║  │ [👤] Carol Williams           │   ║
║  │     Signed up Dec 13, 9:45 AM │   ║
║  └───────────────────────────────┘   ║
╚═══════════════════════════════════════╝
```

## Transaction Flow

### Sign Up Process

```
User clicks "I'll Get This"
         ↓
Dialog opens
         ↓
User clicks "I'll Get This Item"
         ↓
API call to /api/wishlist/[itemId]/purchasers (POST)
         ↓
Transaction submitted to blockchain
         ↓
Transaction monitoring starts
         ↓
Loading toast shown: "Signing up as purchaser..."
         ↓
Transaction confirms
         ↓
Success toast: "Signed up as purchaser!"
         ↓
Purchaser list refreshes
         ↓
UI updates with new count
```

### Remove Process

```
User clicks "You're Getting This"
         ↓
Dialog opens
         ↓
User clicks "Remove Me from This Item"
         ↓
API call to /api/wishlist/[itemId]/purchasers (DELETE)
         ↓
Transaction submitted to blockchain
         ↓
Transaction monitoring starts
         ↓
Loading toast shown: "Removing from purchasers..."
         ↓
Transaction confirms
         ↓
Success toast: "Removed from purchasers!"
         ↓
Purchaser list refreshes
         ↓
UI updates with new count
```

## API Endpoints

### Get Purchasers

```http
GET /api/wishlist/[itemId]/purchasers?itemId=123

Response:
{
  "success": true,
  "purchasers": [
    {
      "purchaser": "0x123...",
      "signedUpAt": "1702656789",
      "exists": true
    }
  ],
  "count": 3
}
```

### Sign Up as Purchaser

```http
POST /api/wishlist/[itemId]/purchasers

Body:
{
  "itemId": "123",
  "purchaserAddress": "0x123..."
}

Response:
{
  "success": true,
  "transactionId": "txn_abc123"
}
```

### Remove as Purchaser

```http
DELETE /api/wishlist/[itemId]/purchasers?itemId=123&purchaserAddress=0x123...

Response:
{
  "success": true,
  "transactionId": "txn_xyz789"
}
```

## Error Handling

### Common Errors

1. **Wallet Not Connected**
   - Error: "Please connect your wallet to sign up as a purchaser"
   - Solution: Click the connect wallet button and authenticate

2. **Owner Trying to Purchase Own Item**
   - Error: "Cannot purchase own item" (contract-level validation)
   - Solution: N/A - This is intentional behavior

3. **Already Signed Up**
   - Error: "Already signed up as purchaser" (contract-level validation)
   - Solution: Remove yourself first, then sign up again if needed

4. **Transaction Failed**
   - Error: "Transaction failed: [reason]"
   - Solution: Check wallet balance, network connection, try again

5. **Network Error**
   - Error: "Failed to fetch purchasers"
   - Solution: Check internet connection, refresh page

## Tips & Best Practices

### For Purchasers

- ✅ Sign up early to show interest
- ✅ Coordinate with other purchasers to avoid duplicates
- ✅ Remove yourself if plans change
- ✅ Check back for updates from the wishlist owner

### For Wishlist Owners

- ✅ Check purchaser lists regularly
- ✅ Communicate with purchasers about preferences
- ✅ Update item details to help purchasers
- ✅ Be clear about item specifications

## Privacy & Security

- **Wallet Addresses:** Displayed to all viewers (consider ENS names)
- **Anonymity:** Use a separate wallet for anonymous purchasing
- **Blockchain:** All signup/removal actions are recorded on-chain
- **Transparency:** Purchaser counts are visible to everyone

## Mobile Experience

The feature is fully responsive:

- Tap badges to view purchasers
- Swipe to dismiss dialogs
- Touch-optimized buttons
- Scrollable purchaser lists

## Browser Compatibility

Tested on:

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers (iOS Safari, Chrome)

## Need Help?

Common questions:

- Q: Can I hide my identity?
  A: Use a wallet without linked social profiles

- Q: Can multiple people buy the same item?
  A: Yes, coordinate with other purchasers

- Q: What if I change my mind?
  A: Simply remove yourself from the purchaser list

- Q: Do I have to buy the item?
  A: No, signing up shows interest but isn't a commitment
