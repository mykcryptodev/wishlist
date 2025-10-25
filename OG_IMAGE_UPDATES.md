# OG Image Updates - Social Integration & Product Showcase

## Overview

Updated the Open Graph (OG) image generation for wishlist pages to use thirdweb's social API and display product images with a cream background matching the light mode theme.

## Key Changes

### 1. Social Profile Integration

**Implementation:**

- Integrated thirdweb's `getSocialProfiles` API to fetch user's social identity
- Prioritizes social names: Farcaster → ENS → Lens
- Displays social avatar when available (100px circular image)
- Falls back to shortened address only if no social profile exists

**Benefits:**

- OG images now show recognizable names instead of wallet addresses
- More personalized and user-friendly sharing experience
- Better social engagement on platforms like Warpcast, Twitter, etc.

**Example:**

```typescript
const profiles = await getSocialProfiles({
  address,
  client: serverClient,
});
```

### 2. Product Image Showcase

**Implementation:**

- Fetches wishlist items from the API
- Displays up to 2 product images in the OG image
- Product images shown in white cards with subtle green borders
- 140px × 140px square images with rounded corners

**Benefits:**

- Visual preview of wishlist items
- More engaging OG images
- Better conversion for viewers

### 3. Light Mode Cream Background

**Color Scheme:**

- Background: `#faf9f7` (cream from light mode)
- Card Background: `#ffffff` (white)
- Text: `#2e2721` (dark for readability)
- Accents: Forest Green (`#468763`), Gold (`#c0a053`)

**Benefits:**

- Consistent with light mode theme
- Warm, inviting appearance
- Better readability on social platforms
- Professional holiday aesthetic

## Technical Details

### API Endpoints Used

1. **Thirdweb Social API:**
   - Function: `getSocialProfiles({ address, client })`
   - Returns: Array of social profiles (Farcaster, ENS, Lens)
2. **Wishlist API:**
   - Endpoint: `/api/wishlist?userAddress={address}`
   - Returns: Wishlist items with image URLs

### Caching

- OG images cached for 1 hour (`revalidate: 3600`)
- Social profile data refreshed with each OG image generation
- Wishlist data cached for 5 minutes

### Error Handling

- Graceful fallback to address if social profiles fail
- Continues without product images if wishlist fetch fails
- Detailed error logging for debugging

## Files Modified

1. **`/src/app/api/wishlist/og/route.tsx`**
   - Added social profile fetching
   - Added wishlist item fetching
   - Updated color scheme to cream background
   - Added product image display logic

2. **`/FARCASTER_OG_IMAGES.md`**
   - Updated documentation with new features
   - Added social integration details
   - Updated design specifications

## Testing

Test the updated OG images:

```bash
# Generic image (light mode themed)
http://localhost:3000/api/wishlist/og

# User-specific with social data and products
http://localhost:3000/api/wishlist/og?address=0x1234...&itemCount=5
```

## Examples

### Before

- Dark background
- Showed shortened wallet address
- No product preview
- Generic appearance

### After

- Cream background (light mode)
- Shows social name (e.g., "dwr.eth", "vitalik.eth")
- Displays social avatar if available
- Shows up to 2 product images
- More personalized and engaging

## Performance Considerations

- Edge runtime for fast generation
- Parallel fetching of fonts and images
- Graceful degradation on API failures
- Cached for 1 hour to reduce API calls

## Future Enhancements

Potential improvements:

- Support for more than 2 product images
- Dynamic layout based on number of items
- More social profile types (Twitter, etc.)
- Custom fallback avatars using Blobbie
- Price display on product cards

## Related Documentation

- [FARCASTER_OG_IMAGES.md](./FARCASTER_OG_IMAGES.md) - Complete OG image documentation
- [Thirdweb Social API Docs](https://portal.thirdweb.com/references/typescript/v5/getSocialProfiles)
