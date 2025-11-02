# Thirdweb API Integration Guide

This document provides comprehensive information about the Thirdweb API integration in this project.

## Overview

This project uses the [Thirdweb API](https://portal.thirdweb.com/connect/ecosystems/api-reference) for blockchain interactions. The API provides a simple HTTP interface for reading from and writing to smart contracts without managing complex Web3 infrastructure.

## Architecture

### Core Components

1. **`src/lib/thirdweb-http-api.ts`** - Typed utility functions for API interactions
2. **API Routes** - Next.js API routes that handle frontend requests and interact with blockchain
3. **Transaction Monitor** - Real-time transaction status tracking

### Data Flow

```
Frontend → Next.js API Route → Thirdweb HTTP API → Blockchain
                                       ↓
                            Transaction Monitoring
                                       ↓
                                Frontend Update
```

## Environment Variables

Required environment variables (add to `.env.local`):

```bash
# Thirdweb Secret Key (from thirdweb dashboard)
THIRDWEB_SECRET_KEY=your_secret_key_here

# Project Wallet Address (the wallet that signs transactions)
THIRDWEB_PROJECT_WALLET=0xYourWalletAddress
```

⚠️ **Security Note**: Never commit `.env.local` or expose `THIRDWEB_SECRET_KEY` on the client side.

## API Functions

### `thirdwebWriteContract(calls, chainId, from?)`

Writes data to smart contracts (creates transactions).

**Parameters:**

- `calls` (ContractCall[]): Array of contract method calls
- `chainId` (number): Blockchain network ID (default: 8453 for Base)
- `from` (string, optional): Wallet address to sign transaction (defaults to `THIRDWEB_PROJECT_WALLET`)

**Returns:** `Promise<WriteContractResponse>`

- `result.transactionIds[]`: Array of transaction IDs for monitoring

**Example:**

```typescript
const result = await thirdwebWriteContract(
  [
    {
      contractAddress: "0x...",
      method: "function mint(address to, uint256 amount)",
      params: ["0xRecipient...", "1000000000000000000"],
    },
  ],
  8453,
);

const txId = result.result.transactionIds[0];
```

### `thirdwebReadContract(calls, chainId)`

Reads data from smart contracts (no transaction required).

**Parameters:**

- `calls` (ContractCall[]): Array of contract method calls
- `chainId` (number): Blockchain network ID (default: 8453 for Base)

**Returns:** `Promise<ThirdwebApiResponse<ReadContractResult[]>>`

- `result[]`: Array of results, one per call
- `result[i].data`: The raw return value
- `result[i].result`: The parsed return value

**Example:**

```typescript
const result = await thirdwebReadContract(
  [
    {
      contractAddress: "0x...",
      method: "function balanceOf(address owner) view returns (uint256)",
      params: ["0xOwner..."],
    },
  ],
  8453,
);

const balance = result.result[0].data;
```

### `getTransactionStatus(transactionId)`

Retrieves the current status of a transaction.

**Parameters:**

- `transactionId` (string): Transaction ID from `thirdwebWriteContract`

**Returns:** `Promise<TransactionStatusResponse>`

- `status`: "CONFIRMED" | "CANCELLED" | string
- `executionResult.onchainStatus`: "SUCCESS" | "FAILED" (only if CONFIRMED)
- `errorMessage`: Error message if failed
- `transactionHash`: On-chain transaction hash
- `confirmedAt`: Timestamp when transaction was confirmed

**Example:**

```typescript
const txData = await getTransactionStatus("tx_abc123...");

if (txData.status === "CONFIRMED") {
  console.log("Transaction successful!");
}
```

## API Routes

### Wishlist Item Management

#### `POST /api/wishlist`

Create a new wishlist item.

**Request Body:**

```json
{
  "title": "Item Title",
  "url": "https://example.com/product",
  "userAddress": "0x...",
  "description": "Optional description",
  "imageUrl": "https://example.com/image.jpg",
  "price": "99.99"
}
```

**Response:**

```json
{
  "success": true,
  "transactionId": "tx_abc123..."
}
```

#### `GET /api/wishlist?userAddress=<address>&page=1&limit=10`

Get wishlist items for a user.

**Query Parameters:**

- `userAddress` (required): User's wallet address
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**

```json
{
  "success": true,
  "items": [...],
  "totalItems": 5,
  "page": 1,
  "limit": 10
}
```

#### `PUT /api/wishlist/[itemId]`

Update an existing wishlist item.

**Request Body:**

```json
{
  "itemId": "1",
  "title": "Updated Title",
  "url": "https://example.com/product",
  "description": "Updated description",
  "imageUrl": "https://example.com/new-image.jpg",
  "price": "129.99"
}
```

#### `DELETE /api/wishlist/[itemId]?itemId=<id>`

Delete a wishlist item.

### Purchaser Management

#### `POST /api/wishlist/[itemId]/purchasers`

Add a purchaser to an item.

**Request Body:**

```json
{
  "itemId": "1",
  "purchaserAddress": "0x..."
}
```

#### `DELETE /api/wishlist/[itemId]/purchasers?itemId=<id>&purchaserAddress=<address>`

Remove a purchaser from an item.

#### `GET /api/wishlist/[itemId]/purchasers?itemId=<id>`

Get all purchasers for an item.

**Response:**

```json
{
  "success": true,
  "purchasers": [...],
  "count": 2
}
```

### Transaction Monitoring

#### `GET /api/transactions/monitor?transactionId=<id>`

Check transaction status.

**Response:**

```json
{
  "success": true,
  "transactionId": "tx_abc123...",
  "status": "success",
  "error": null,
  "data": {...}
}
```

**Status Values:**

- `pending`: Transaction is being processed (status !== "CONFIRMED")
- `success`: Transaction confirmed (status === "CONFIRMED")
- `cancelled`: Transaction was cancelled (status === "CANCELLED")

## Transaction Monitoring Hook

Use the `useTransactionMonitor` hook on the frontend:

```typescript
import { useTransactionMonitor } from "@/hooks/useTransactionMonitor";

function MyComponent() {
  const [txId, setTxId] = useState<string | null>(null);

  const { status, isMonitoring } = useTransactionMonitor({
    transactionId: txId,
    onSuccess: (data) => {
      console.log("Transaction successful!", data);
    },
    onError: (error) => {
      console.error("Transaction failed:", error);
    },
  });

  return (
    <div>
      {isMonitoring && <p>Status: {status?.status}</p>}
    </div>
  );
}
```

## Error Handling

All API functions and routes include comprehensive error handling:

### API Function Errors

```typescript
try {
  const result = await thirdwebWriteContract([...]);
} catch (error) {
  // Error includes:
  // - HTTP status codes
  // - Thirdweb correlation IDs
  // - Detailed error messages
  console.error(error.message);
}
```

### API Route Errors

All routes return structured error responses:

```json
{
  "error": "Human-readable error message",
  "details": "Technical error details"
}
```

**Common HTTP Status Codes:**

- `400`: Bad request (validation error)
- `500`: Server error (blockchain or API error)

## Best Practices

### 1. Input Validation

Always validate input on both client and server:

- Wallet addresses: Must be 0x followed by 40 hex characters
- Item IDs: Must be positive integers
- Prices: Must be non-negative numbers

### 2. Transaction Monitoring

Always monitor transactions after write operations:

```typescript
// 1. Submit transaction
const result = await fetch("/api/wishlist", {
  method: "POST",
  body: JSON.stringify(data),
});

// 2. Get transaction ID
const { transactionId } = await result.json();

// 3. Monitor until completion
const monitor = useTransactionMonitor({
  transactionId,
  onSuccess: handleSuccess,
  onError: handleError,
});
```

### 3. Error Recovery

Implement proper error handling for failed transactions:

```typescript
onError: error => {
  // Log error for debugging
  console.error("Transaction failed:", error);

  // Show user-friendly message
  showErrorToast("Transaction failed", "Please try again");

  // Reset form/state
  resetForm();
};
```

### 4. Gas Optimization

Batch multiple operations when possible:

```typescript
// Instead of multiple separate calls
const calls = [
  { contractAddress: "0x...", method: "...", params: [...] },
  { contractAddress: "0x...", method: "...", params: [...] },
  { contractAddress: "0x...", method: "...", params: [...] }
];

const result = await thirdwebWriteContract(calls);
```

## TypeScript Types

### ContractCall

```typescript
interface ContractCall {
  contractAddress: string;
  method: string; // Full Solidity function signature
  params: any[];
  value?: string; // Wei amount for payable functions
}
```

### WriteContractResponse

```typescript
interface WriteContractResponse {
  result: {
    transactionIds: string[];
  };
}
```

### TransactionStatusResponse

```typescript
interface TransactionStatusResponse {
  id: string;
  status: "CONFIRMED" | "CANCELLED" | string;
  transactionHash?: string;
  errorMessage?: string | null;
  confirmedAt?: string;
  confirmedAtBlockNumber?: string;
  executionResult?: {
    status: "CONFIRMED" | string;
    onchainStatus?: "SUCCESS" | "FAILED";
    transactionHash?: string;
    receipt?: any;
  };
  createdAt?: string;
  cancelledAt?: string | null;
}
```

## Troubleshooting

### Common Issues

**Issue: "Sender address is required"**

- Solution: Ensure `THIRDWEB_PROJECT_WALLET` is set in `.env.local`

**Issue: "Invalid contract method signature"**

- Solution: Use full Solidity function signatures, e.g., `"function mint(address to, uint256 amount)"`

**Issue: "Transaction stuck in pending"**

- Solution: Check blockchain network status and gas prices. Transactions can take 5-30 seconds on Base.

**Issue: "Failed to parse error response"**

- Solution: Check your `THIRDWEB_SECRET_KEY` is valid and has proper permissions

### Debug Mode

Enable detailed logging:

```typescript
// In your API route
console.log("Request body:", body);
console.log("Contract call:", calls);
console.log("API response:", result);
```

## Rate Limits

Thirdweb API has rate limits based on your plan:

- Free tier: ~100 requests/minute
- Paid tiers: Higher limits

Monitor your usage in the [Thirdweb Dashboard](https://thirdweb.com/dashboard).

## Resources

- [Thirdweb API Documentation](https://portal.thirdweb.com/connect/ecosystems/api-reference)
- [Thirdweb Dashboard](https://thirdweb.com/dashboard)
- [Base Network Documentation](https://docs.base.org/)
- [Ethers.js Documentation](https://docs.ethers.org/) (for understanding types)

## Support

For issues with:

- **This integration**: Check console logs and error messages
- **Thirdweb API**: Visit [Thirdweb Discord](https://discord.gg/thirdweb)
- **Smart contracts**: Review contract code in `solidity/contracts/src/`
