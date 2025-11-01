import { dedupe, flag } from "flags/next";
import type { Identify } from "flags";
import { statsigAdapter, type StatsigUser } from "@flags-sdk/statsig";

// Identify function for Statsig - provides user context for flag evaluation
export const identify = dedupe((async () => ({
  // You can add more user properties here later if needed
  // For now, we'll use a simple userID
  userID: "anonymous", // This can be enhanced later with actual user IDs
})) satisfies Identify<StatsigUser>);

// Helper function to create feature flags with Statsig adapter
export const createFeatureFlag = (key: string) =>
  flag<boolean, StatsigUser>({
    key,
    adapter: statsigAdapter.featureGate(gate => gate.value, {
      exposureLogging: true,
    }),
    identify,
    // Fallback for development when Statsig is not configured
    async decide() {
      return process.env.NODE_ENV === "development";
    },
  });

// Create the wish governance page flag
export const wishGovernancePageFlag = createFeatureFlag("wish-governance-page");

export const flags = [wishGovernancePageFlag];
