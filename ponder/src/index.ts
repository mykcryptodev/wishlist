import { ponder } from "ponder:registry";
import { burnEvents, burnerTotals } from "ponder:schema";

ponder.on("StakeAWish:StakedWishesBurned", async ({ event, context }) => {
  // 1. Record the individual burn event
  await context.db.insert(burnEvents).values({
    id: `${event.transaction.hash}-${event.log.logIndex}`,
    staker: event.args.staker,
    amount: event.args.amount,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });

  // 2. Upsert the staker's total
  await context.db
    .insert(burnerTotals)
    .values({
      staker: event.args.staker,
      totalBurned: event.args.amount,
      burnCount: 1,
    })
    .onConflictDoUpdate(row => ({
      totalBurned: row.totalBurned + event.args.amount,
      burnCount: row.burnCount + 1,
    }));
});
