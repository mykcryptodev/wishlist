# Utility Library

This directory contains shared utility functions and helpers used throughout the application.

## Files

### `thirdweb-http-api.ts`

Typed wrappers around the Thirdweb API for blockchain interactions.

**Key Functions:**

- `thirdwebWriteContract()` - Execute contract write operations
- `thirdwebReadContract()` - Read data from contracts
- `getTransactionStatus()` - Monitor transaction status

**Documentation:** See [/THIRDWEB_API.md](../../THIRDWEB_API.md) for complete usage guide.

### `cache-utils.ts`

Utilities for Redis caching operations.

### `date.ts`

Date formatting and manipulation utilities.

### `farcaster-metadata.ts`

Farcaster frame metadata generation.

### `payout-utils.ts`

Utilities for calculating and processing payouts.

### `redis.ts`

Redis client configuration and connection management.

### `toast.ts` & `toast.tsx`

Toast notification utilities and components.

### `utils.ts`

General-purpose utility functions.

## Usage

Import utilities as needed:

```typescript
import {
  thirdwebWriteContract,
  thirdwebReadContract,
} from "@/lib/thirdweb-http-api";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
```

## Best Practices

1. **Keep utilities pure** - Prefer pure functions without side effects
2. **Add types** - Always include TypeScript types
3. **Document usage** - Add JSDoc comments for complex functions
4. **Test thoroughly** - Ensure utilities work in all expected scenarios
