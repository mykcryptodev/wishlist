import { onchainTable } from "ponder";

export const burnEvents = onchainTable("burn_events", t => ({
  id: t.text().primaryKey(), // txHash-logIndex
  staker: t.hex().notNull(),
  amount: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const burnerTotals = onchainTable("burner_totals", t => ({
  staker: t.hex().primaryKey(),
  totalBurned: t.bigint().notNull(),
  burnCount: t.integer().notNull(),
}));
