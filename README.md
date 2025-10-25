# Holiday Wishlist 🎄

![Holiday Wishlist](public/images/hero.png)

A decentralized holiday wishlist application where users can create and share their gift wishlists, coordinate gift-giving through private exchanges, and manage purchases with blockchain-backed transparency.

## Features

✨ **Create & Share Wishlists** - Build your holiday wishlist with items, descriptions, images, and prices  
🎁 **Purchaser Signup** - Coordinate who's buying what to avoid duplicate gifts  
🎅 **Gift Exchanges** - Create private groups to coordinate gift-giving with friends and family  
🔐 **Blockchain-Backed** - All wishlist data stored on-chain for transparency and permanence  
💼 **Multiple Auth Options** - Connect with email, social logins, or crypto wallets via Thirdweb  
🌐 **Farcaster Integration** - Share your wishlist on Farcaster with rich OG images  
🎨 **Festive Theme** - Beautiful Christmas-themed UI with snowfall and decorations

## How It Works

### Smart Contracts

**Wishlist Contract** - Core contract for managing wishlist items and purchaser signups. Users create items with title, description, URL, image, and price. Other users can sign up as purchasers to indicate they're buying an item. The contract prevents users from seeing who's purchasing their own items to maintain gift surprises.

Key features:

- Create, update, and delete wishlist items
- Sign up/remove as purchaser for items
- Track all addresses with wishlists (directory)
- Permission system for manager operations
- Event emissions for all state changes

Deployed on Base Sepolia and Base Mainnet.

#### Deploy Contracts

```bash
cd solidity
npx thirdweb deploy -k YOUR_SECRET_KEY
```

#### Run Tests

```bash
cd solidity
forge test -vv
```

### Frontend & APIs

**Next.js App** - Server-rendered pages for creating wishlists, browsing items, and managing gift exchanges. Uses Thirdweb SDK for wallet connections and contract interactions.

**API Routes**:

- `/api/wishlist/[address]` - Fetch wishlist items for a user
- `/api/wishlist/og` - Generate dynamic OG images for social sharing
- `/api/purchasers` - Manage purchaser signups with exchange filtering
- `/api/exchanges/*` - Create and manage gift exchange groups
- `/api/farcaster/*` - Farcaster frame and metadata endpoints
- `/api/auth/*` - SIWE (Sign-In With Ethereum) authentication

**Key Features**:

- **Thirdweb Authentication**: Email, social logins, passkeys, and wallet connections
- **SIWE Integration**: Secure server-side authentication with wallet signatures
- **Gift Exchange Privacy**: Filter purchaser visibility by exchange membership
- **Supabase Database**: Store exchange groups, memberships, and user profiles
- **Redis Caching**: Cache blockchain data for improved performance
- **Dynamic OG Images**: Generate shareable images with wishlist previews
- **Farcaster Frames**: Interactive frames for viewing wishlists on Farcaster

### Gift Exchanges

Gift exchanges are private groups where members can coordinate gift-giving:

1. **Create Exchange** - Generate a unique 6-character invite code
2. **Invite Members** - Share the code with friends/family
3. **Coordinate Gifts** - See who in your exchange has signed up as purchasers
4. **Privacy Protection** - Owners never see their own purchasers

When viewing a wishlist:

- **Your own list**: Purchaser info is hidden (keeps gifts a surprise!)
- **Exchange member's list**: See only purchasers from your shared exchanges
- **Non-member's list**: See all purchasers (public view)

See [GIFT_EXCHANGE_USER_GUIDE.md](GIFT_EXCHANGE_USER_GUIDE.md) for detailed instructions.

## Development

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Format and lint code
bun run format
bun run lint

# Check code quality
bun run check
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Thirdweb (for wallet auth and blockchain interactions)
THIRDWEB_SECRET_KEY=your_secret_key
THIRDWEB_PROJECT_WALLET=your_project_wallet_address
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
ADMIN_PRIVATE_KEY=your_private_key_for_siwe

# Neynar (for Farcaster integration)
NEYNAR_API_KEY=your_neynar_api_key

# Upstash Redis (for caching blockchain data)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Supabase (for exchange groups and user data)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Setup Guides

- **Redis**: See [REDIS_SETUP.md](REDIS_SETUP.md) for Upstash Redis configuration
- **SIWE Auth**: See [SIWE_SETUP_INSTRUCTIONS.md](SIWE_SETUP_INSTRUCTIONS.md) for authentication setup
- **Gift Exchanges**: See [GIFT_EXCHANGE_SETUP.md](GIFT_EXCHANGE_SETUP.md) for exchange feature setup
- **Thirdweb**: See [THIRDWEB_SUMMARY.md](THIRDWEB_SUMMARY.md) for wallet integration details

## Deployment

The app is designed to run on Vercel with the following services:

- **Frontend**: Vercel (Next.js)
- **Smart Contracts**: Base Sepolia (testnet) / Base Mainnet (production)
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **Auth**: Thirdweb + SIWE
- **Farcaster**: Neynar API

Deploy the frontend:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configure environment variables in Vercel dashboard before deploying.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons
- **Blockchain**: Thirdweb SDK v5, Solidity (Foundry)
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **Auth**: Thirdweb Embedded Wallets, SIWE
- **Social**: Farcaster (Neynar), OG Image Generation (@vercel/og)
- **Forms**: React Hook Form, Zod validation

## Project Structure

```
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── exchanges/      # Gift exchange pages
│   │   ├── wishlist/       # Wishlist pages
│   │   └── users/          # User directory
│   ├── components/         # React components
│   │   ├── auth/          # Authentication UI
│   │   ├── exchanges/     # Exchange management
│   │   ├── wishlist/      # Wishlist UI
│   │   └── ui/            # shadcn components
│   ├── lib/               # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # Context providers
│   └── constants/         # Contract ABIs and addresses
├── solidity/              # Smart contracts
│   ├── contracts/src/     # Solidity source files
│   ├── script/            # Deployment scripts
│   └── test/              # Contract tests
└── public/                # Static assets
```

## Key Documentation

- [GIFT_EXCHANGE_USER_GUIDE.md](GIFT_EXCHANGE_USER_GUIDE.md) - Complete guide for using gift exchanges
- [PURCHASER_SIGNUP_USAGE.md](PURCHASER_SIGNUP_USAGE.md) - How purchaser signup works
- [WISHLIST_DIRECTORY_FEATURE.md](WISHLIST_DIRECTORY_FEATURE.md) - Browse wishlists feature
- [FARCASTER_OG_IMAGES.md](FARCASTER_OG_IMAGES.md) - Social sharing configuration
- [CHRISTMAS_THEME.md](CHRISTMAS_THEME.md) - UI theming details

## Contributing

This is a personal/demonstration project, but feel free to fork and adapt for your own use!

## License

MIT License - see individual files for details.

---

🎄 Happy Holidays! 🎁
