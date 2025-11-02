# Wishlist App Documentation

Welcome to the Wishlist app documentation! This directory contains guides and reference materials for all features and integrations.

## 📚 Documentation Index

### Core Features

#### 🎁 Wishlist Management

- **[Edit Functionality](./EDIT_FUNCTIONALITY_SUMMARY.md)** - How to edit wishlist items
- **[Purchaser Signup](./PURCHASER_SIGNUP_FEATURE.md)** - Technical details of the purchaser signup feature
- **[Purchaser Signup Usage](./PURCHASER_SIGNUP_USAGE.md)** - User guide for signing up as a purchaser

#### 🎄 Gift Exchanges

- **[Gift Exchange Setup](./GIFT_EXCHANGE_SETUP.md)** - Technical setup guide for the gift exchange feature
- **[Gift Exchange User Guide](./GIFT_EXCHANGE_USER_GUIDE.md)** - End-user documentation for creating and joining exchanges

#### 📰 Social Features

- **[Wishlist Feed](./WISHLIST_FEED_FEATURE.md)** - Real-time feed of newly created wishlist items
- **[Wishlist Directory](./WISHLIST_DIRECTORY_FEATURE.md)** - Browse all wishlists with social profiles
- **[User Search](./USER_SEARCH_README.md)** - Search for Farcaster users with wishlist integration

### Integrations

#### 🔗 Thirdweb

- **[Thirdweb API Guide](./THIRDWEB_API.md)** - Complete reference for blockchain interactions via Thirdweb API
- **[Smart Account Auth Fix](./SMART_ACCOUNT_AUTH_FIX.md)** - Important fix for smart account wallet authentication

#### 🔐 Authentication

- **[SIWE Authentication](./SIWE_AUTHENTICATION.md)** - Sign-In with Ethereum implementation details

#### 🖼️ Social Sharing

- **[Farcaster OG Images](./FARCASTER_OG_IMAGES.md)** - Dynamic Open Graph images and Farcaster miniapp integration

### Infrastructure

#### 💾 Caching

- **[Redis Setup](./REDIS_SETUP.md)** - Configure Redis caching for improved performance

### Design & Styling

#### 🎨 Theme

- **[Christmas Theme](./CHRISTMAS_THEME.md)** - Festive design implementation details
- **[Fredoka Font & Text Stroke](./FREDOKA_TEXT_STROKE.md)** - Typography and text effects

## 🚀 Quick Start

### For Developers

1. **Setup Environment**: Start with [Thirdweb API Guide](./THIRDWEB_API.md) for required environment variables
2. **Enable Caching**: Follow [Redis Setup](./REDIS_SETUP.md) for better performance
3. **Authentication**: Configure auth using [SIWE Authentication](./SIWE_AUTHENTICATION.md)
4. **Gift Exchanges**: Set up Supabase using [Gift Exchange Setup](./GIFT_EXCHANGE_SETUP.md)

### For Users

1. **Using Exchanges**: See [Gift Exchange User Guide](./GIFT_EXCHANGE_USER_GUIDE.md)
2. **Purchaser Features**: Check [Purchaser Signup Usage](./PURCHASER_SIGNUP_USAGE.md)

## 📖 Feature Overview

### Active Features

✅ **Christmas Theme** - Festive design with snowfall and lights  
✅ **Wishlist Management** - Create, edit, delete wishlist items  
✅ **Purchaser Signup** - Claim interest in buying items  
✅ **Gift Exchanges** - Private groups for coordinating gifts  
✅ **Feed** - Real-time stream of new wishes  
✅ **User Search** - Find Farcaster users with wishlists  
✅ **Directory** - Browse all wishlists with social profiles  
✅ **OG Images** - Dynamic social sharing images  
✅ **Redis Caching** - Performance optimization  
✅ **SIWE Auth** - Secure wallet-based authentication

### Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Blockchain**: Thirdweb SDK v5, Base L2
- **Database**: Supabase (for exchanges)
- **Caching**: Upstash Redis
- **Social**: Neynar (Farcaster), ENS
- **Auth**: Sign-In with Ethereum (SIWE)

## 🔧 Configuration Files

### Required Environment Variables

```bash
# Thirdweb (Required)
THIRDWEB_SECRET_KEY=
THIRDWEB_PROJECT_WALLET=
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=

# Authentication (Required)
ADMIN_PRIVATE_KEY=

# Supabase (Required for exchanges)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis (Optional, recommended)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Neynar (Optional, for user search)
NEYNAR_API_KEY=

# App URL (Optional)
NEXT_PUBLIC_APP_URL=
```

See `env.example` in the project root for a complete template.

## 📝 Documentation Maintenance

### Last Updated

November 2, 2025

### Recent Changes

- Consolidated redundant documentation
- Updated Redis caching documentation
- Removed outdated debugging guides
- Clarified authentication setup

### Contributing

When adding new features:

1. Create a new markdown file in this directory
2. Add an entry to this README
3. Include setup instructions, usage examples, and technical details
4. Update the Quick Start section if needed

## 🆘 Getting Help

### Common Issues

**Redis not working?**
→ See [Redis Setup](./REDIS_SETUP.md) troubleshooting section

**Authentication failing?**
→ Check [SIWE Authentication](./SIWE_AUTHENTICATION.md) and [Smart Account Auth Fix](./SMART_ACCOUNT_AUTH_FIX.md)

**Gift exchanges not loading?**
→ Verify Supabase setup in [Gift Exchange Setup](./GIFT_EXCHANGE_SETUP.md)

**Thirdweb API errors?**
→ Consult [Thirdweb API Guide](./THIRDWEB_API.md) error handling section

### Support Resources

- 📖 Thirdweb Docs: https://portal.thirdweb.com/
- 💬 Thirdweb Discord: https://discord.gg/thirdweb
- 🔗 Base Docs: https://docs.base.org/
- 📚 Supabase Docs: https://supabase.com/docs

---

**Happy building!** 🎉
