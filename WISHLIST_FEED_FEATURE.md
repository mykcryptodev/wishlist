# Wishlist Feed Feature

## Overview

A real-time community feed that displays the latest wishlist items created by users across the platform. The feed uses blockchain events to track new wishes and presents them in a beautiful, social media-style interface.

## Architecture

### Event-Based Tracking

The feed leverages the `ItemCreated` event from the Wishlist.sol smart contract:

```solidity
event ItemCreated(
    uint256 indexed itemId,
    address indexed owner,
    string title,
    string url
);
```

### Components

#### 1. API Route: `/api/wishlist/feed`

**File:** `src/app/api/wishlist/feed/route.ts`

Fetches `ItemCreated` events from the Wishlist contract using the Thirdweb API:

- Supports pagination (page, limit)
- Sorts events in descending order (newest first)
- Returns decoded event data with metadata

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20, max: 100) - Items per page

**Response Format:**

```json
{
  "success": true,
  "items": [
    {
      "itemId": "123",
      "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "title": "PS5 Console",
      "url": "https://...",
      "blockNumber": "12345678",
      "blockTimestamp": "1699999999",
      "transactionHash": "0xabc..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
```

#### 2. Custom Hook: `useWishlistFeed`

**File:** `src/hooks/useWishlistFeed.ts`

React Query hook that provides:

- Automatic caching (5 minutes)
- Data freshness management (30 seconds stale time)
- Easy refetching and pagination
- Loading and error states

**Usage:**

```tsx
const { data, isLoading, error, refetch } = useWishlistFeed(page, limit);
```

#### 3. Feed Component: `<WishlistFeed />`

**File:** `src/components/wishlist/feed.tsx`

A beautiful, responsive feed component featuring:

- Real-time wish display
- Relative timestamps (e.g., "2h ago")
- Truncated wallet addresses
- Direct links to wish URLs and user profiles
- Manual refresh button
- Pagination controls
- Loading, error, and empty states

#### 4. Demo Page: `/feed`

**File:** `src/app/feed/page.tsx`

Full-page implementation showcasing the feed with proper layout and styling.

## Thirdweb API Integration

### Endpoint Used

```
GET /v1/contracts/{chainId}/{address}/events
```

**Documentation:** https://portal.thirdweb.com/reference#tag/contracts/get/v1/contracts/{chainId}/{address}/events

### Query Parameters

- `page` - Page number for pagination
- `limit` - Number of events per page
- `sortOrder` - Sort order (desc for newest first)
- `signature` (optional) - Event signature hash to filter specific events

### Event Decoding

The Thirdweb API automatically decodes events if:

1. The contract ABI is available in their system
2. The event signature matches known patterns

Decoded events include:

- `eventName` - Name of the event (e.g., "ItemCreated")
- `params` - Array of decoded parameters with name, type, and value

## Features

### Current Implementation

✅ Fetch latest ItemCreated events  
✅ Display in beautiful feed format  
✅ Pagination support  
✅ Manual refresh  
✅ Responsive design  
✅ Loading states  
✅ Error handling  
✅ Relative timestamps  
✅ User profile links  
✅ External product links

### Potential Enhancements

- [ ] Real-time updates using WebSockets or polling
- [ ] Filter by date range
- [ ] Search/filter by user
- [ ] Rich preview cards for product URLs
- [ ] Reactions/likes (requires additional contract events)
- [ ] Show who claimed items (track PurchaserSignedUp events)
- [ ] Infinite scroll instead of pagination
- [ ] Show item images from imageUrl field
- [ ] Export feed to social media

## Technical Notes

### Event Signature Hash

The event signature for `ItemCreated` is calculated using Keccak256:

```
keccak256("ItemCreated(uint256,address,string,string)")
```

This hash is used to filter events if the Thirdweb API doesn't automatically decode them.

### Rate Limiting

- React Query caching reduces API calls
- 30-second stale time prevents excessive fetching
- Manual refresh available for users wanting fresh data

### Performance

- Events are fetched server-side (API route)
- Client receives pre-formatted data
- Pagination keeps payloads small
- 5-minute cache minimizes redundant requests

## Usage

### Display Feed on Any Page

```tsx
import { WishlistFeed } from "@/components/wishlist/feed";

export default function MyPage() {
  return (
    <div>
      <h1>Community Wishes</h1>
      <WishlistFeed />
    </div>
  );
}
```

### Custom Hook Integration

```tsx
import { useWishlistFeed } from "@/hooks/useWishlistFeed";

function CustomFeed() {
  const { data, isLoading } = useWishlistFeed(1, 10);

  if (isLoading) return <Loading />;

  return (
    <div>
      {data?.items.map(item => (
        <div key={item.itemId}>{item.title}</div>
      ))}
    </div>
  );
}
```

## Related Contract Events

While the current implementation focuses on `ItemCreated`, these other events could enhance the feed:

### ItemUpdated

Shows when users modify their wishes

```solidity
event ItemUpdated(
    uint256 indexed itemId,
    address indexed owner,
    string title
);
```

### PurchaserSignedUp

Shows when someone claims they'll buy an item

```solidity
event PurchaserSignedUp(
    uint256 indexed itemId,
    address indexed purchaser,
    address indexed itemOwner
);
```

### UserAddedToWishlistDirectory

Tracks new users joining the platform

```solidity
event UserAddedToWishlistDirectory(
    address indexed user
);
```

## Testing

### Manual Testing

1. Navigate to `/feed` page
2. Verify feed loads with recent wishes
3. Test pagination (Next/Previous buttons)
4. Test refresh button
5. Check responsive design on mobile

### API Testing

```bash
# Fetch first page
curl http://localhost:3000/api/wishlist/feed

# Fetch specific page with custom limit
curl http://localhost:3000/api/wishlist/feed?page=2&limit=10
```

## Deployment Notes

### Environment Variables Required

- `THIRDWEB_SECRET_KEY` - Backend API key for Thirdweb

### Configuration

- Chain ID and contract address are defined in `src/constants/index.ts`
- Supports both Base mainnet and Base Sepolia testnet

## Future Considerations

1. **Real-time Updates**: Implement WebSocket connection or polling for live updates
2. **Event Aggregation**: Combine multiple event types (Created, Updated, Purchased) into unified feed
3. **Social Features**: Add comments, reactions, or sharing capabilities
4. **Analytics**: Track popular items, trending wishes, user engagement
5. **Notifications**: Alert users when someone purchases from their wishlist
6. **Feed Customization**: Allow users to filter/sort by different criteria

## Support

For questions or issues with the feed implementation, refer to:

- Thirdweb API Docs: https://portal.thirdweb.com/reference
- Contract source: `solidity/contracts/src/Wishlist.sol`
- Original implementation docs in this directory
