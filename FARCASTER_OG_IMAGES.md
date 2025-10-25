# Farcaster Miniapp Metadata & OG Images

This document explains the Farcaster miniapp metadata and dynamic OG image generation for wishlist pages.

## Overview

We've implemented dynamic Open Graph (OG) images and Farcaster miniapp metadata for wishlist pages to provide rich social sharing experiences and deep linking within the Farcaster ecosystem.

## Features

### 1. Dynamic OG Image Generation

**Location:** `/src/app/api/wishlist/og/route.tsx`

This route generates beautiful, dynamic OG images using Vercel's `@vercel/og` package. It creates two types of images:

#### Generic Wishlist Image (No Address)

- Used for the main `/wishlist` page
- Shows "Holiday Wishlist" with Christmas theme
- Cream background from light mode theme
- Decorative elements (Christmas tree, Santa, snowman)
- Call-to-action: "Create and share your wishlist • Coordinate with loved ones"

**URL:** `https://your-domain.com/api/wishlist/og`

#### User-Specific Wishlist Image

- Used for `/wishlist/[address]` pages
- **Fetches social profiles from thirdweb API** (Farcaster, ENS, Lens)
- Displays user's social name and avatar (no raw addresses shown unless no social profile found)
- Cream background matching the light mode theme
- Shows item count badge if items exist
- **Displays up to 2 product images** from the wishlist
- Personalized messaging: "Browse & mark items you'd like to gift"

**URL:** `https://your-domain.com/api/wishlist/og?address=0x123...&itemCount=5`

**Parameters:**

- `address` (optional): Wallet address of the wishlist owner
- `itemCount` (optional): Number of items in the wishlist (default: "0")

**Social Data Integration:**

The OG image route automatically:

1. Fetches social profiles using thirdweb's `getSocialProfiles` API
2. Prioritizes Farcaster > ENS > Lens for name and avatar
3. Falls back to shortened address only if no social profile exists
4. Fetches wishlist items to display product images (up to 2)

### 2. Farcaster Miniapp Metadata

Both wishlist pages include Farcaster miniapp metadata for seamless integration with Farcaster clients.

#### Root Wishlist Page (`/wishlist`)

**Location:** `/src/app/wishlist/layout.tsx`

- Static metadata for the user's own wishlist
- OG image: Generic "Create Your Wishlist" image
- Includes both `fc:miniapp` and `fc:frame` tags for compatibility

#### User-Specific Wishlist Page (`/wishlist/[address]`)

**Location:** `/src/app/wishlist/[address]/layout.tsx`

- Dynamic metadata generated based on the user's address
- Fetches wishlist data to display accurate item count
- OG image: Personalized with address and item count
- Includes both `fc:miniapp` and `fc:frame` tags

## Metadata Structure

Each page includes:

1. **Standard Meta Tags**
   - `title`: Page title
   - `description`: Page description

2. **Open Graph Tags**
   - `og:title`: Social sharing title
   - `og:description`: Social sharing description
   - `og:image`: Dynamic OG image URL
   - `og:url`: Canonical URL
   - `og:type`: "website"

3. **Twitter Card Tags**
   - `twitter:card`: "summary_large_image"
   - `twitter:title`: Same as og:title
   - `twitter:description`: Same as og:description
   - `twitter:image`: Same as og:image

4. **Farcaster Miniapp Tags**
   - `fc:miniapp`: JSON with miniapp configuration
   - `fc:frame`: JSON with frame configuration (backward compatibility)

## Farcaster Miniapp Configuration

The miniapp metadata includes:

```json
{
  "version": "1",
  "imageUrl": "<dynamic-og-image-url>",
  "button": {
    "title": "Launch Wishlist",
    "action": {
      "type": "launch_miniapp",
      "name": "Wishlist",
      "url": "<wishlist-url>",
      "splashImageUrl": "/images/logo-no-bg.png",
      "splashBackgroundColor": "#000000"
    }
  }
}
```

## Image Specifications

All OG images are generated with:

- **Size:** 1200x630 pixels
- **Format:** PNG
- **Runtime:** Edge (for fast generation)

### Design Elements

1. **Background**
   - Cream background (#faf9f7) from light mode theme
   - Subtle radial gradients using forest green, gold, and pine green accents
   - Warm, inviting Christmas-themed appearance
2. **Typography**
   - Main heading: Dark text (#2e2721) for readability on light background
   - Secondary text: Gold (#c0a053) for festive accents
   - Tertiary text: Muted brown (#6b6560)
   - Font: Fredoka (Medium and Bold weights)

3. **Color Palette** (Christmas Theme)
   - Forest Green: #468763
   - Gold: #c0a053
   - Pine Green: #3d7357
   - Cream Background: #faf9f7
   - Card Background: #ffffff
   - Dark Text: #2e2721

4. **Decorative Elements**
   - Christmas tree emoji (🎄)
   - Santa emoji (🎅)
   - Snowman emoji (⛄)
   - Gift emoji (🎁)
   - Monster character reading (bottom right)
   - Positioned with varying opacity for depth

5. **User-Specific Features**
   - Social avatar (circular, 100px) with forest green border
   - Product images (140px square) in white cards with subtle shadows
   - Item count badge with green background
   - Up to 2 product images displayed side-by-side

## Testing

You can test the OG images by visiting:

1. **Generic image:**

   ```
   http://localhost:3000/api/wishlist/og
   ```

2. **User-specific image:**

   ```
   http://localhost:3000/api/wishlist/og?address=0x1234567890abcdef1234567890abcdef12345678&itemCount=5
   ```

3. **With custom name:**
   ```
   http://localhost:3000/api/wishlist/og?address=0x1234...&name=Alice&itemCount=3
   ```

## Social Sharing Preview

To preview how the links look when shared:

1. **Twitter:** Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
2. **Facebook:** Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
3. **LinkedIn:** Share and LinkedIn will automatically generate preview
4. **Farcaster:** Share in any Farcaster client that supports miniapps

## Performance

- **Edge Runtime:** OG images are generated at the edge for low latency
- **Caching:** Metadata fetches wishlist data with 5-minute cache (`revalidate: 300`)
- **On-Demand:** Images are generated on-demand (not pre-built)

## Future Enhancements

Possible improvements:

1. Add more personalization (profile images, custom themes)
2. Include wishlist item previews in OG image
3. Support for custom OG image templates
4. Add animation/video support for richer social cards
5. A/B test different designs for conversion

## Related Files

- `/src/lib/farcaster-metadata.ts` - Utility for generating Farcaster metadata
- `/src/app/.well-known/farcaster.json/route.ts` - Farcaster app manifest
- `/src/constants/index.ts` - App name and description constants

## Dependencies

- `@vercel/og` - OG image generation
- `@farcaster/miniapp-sdk` - Farcaster miniapp integration
- Next.js 15+ - App router with metadata support
