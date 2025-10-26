import { flag } from "@vercel/flags/next";

const WISH_FLAG_ENV_OVERRIDE = process.env.NEXT_PUBLIC_WISH_GOVERNANCE_PAGE;

export const wishGovernancePageFlag = flag<boolean>({
  key: "wish-governance-page",
  description: "Enable the public governance overview for the $WISH token.",
  options: [
    { label: "Off", value: false },
    { label: "On", value: true },
  ],
  /**
   * The decide callback is the synchronous fallback that runs when no
   * provider (for example the Vercel dashboard) sends an override for this
   * request. It keeps local development convenient while making production
   * environments opt-in by default.
   */
  async decide() {
    if (WISH_FLAG_ENV_OVERRIDE === "true") {
      return true;
    }

    if (WISH_FLAG_ENV_OVERRIDE === "false") {
      return false;
    }

    // Without any explicit override we default to disabled, but allow local
    // development to view the page without needing to configure a flag.
    return process.env.NODE_ENV === "development";
  },
});

export const flags = [wishGovernancePageFlag];
