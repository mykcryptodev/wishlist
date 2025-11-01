import {
  Beef,
  Coins,
  Dices,
  Flame,
  Gift,
  HandCoins,
  HandHeart,
  PiggyBank,
  Vote,
} from "lucide-react";

import Buy from "@/components/buy";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const governanceSteps = [
  {
    title: "Fee Collection",
    description:
      "Trading fees from $WISH token activity are automatically collected in ETH. These fees accumulate into a dedicated fund that will be used exclusively for purchasing and shipping holiday gifts.",
    icon: <PiggyBank className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: "Random Winner Selection",
    description:
      "On December 1, 2025, winners are selected via rofl.house using Chainlink VRF for provably fair onchain randomness. Only users with a Neynar score of 0.9 or higher are eligible, ensuring real, trusted community members.",
    icon: <Dices className="h-6 w-6 text-sky-600" />,
  },
  {
    title: "Community Governance (Optional)",
    description:
      "Depending on available funds and item costs, $WISH token holders may vote via Snapshot to help decide which specific gifts to purchase from winners' wishlists or address other decisions.",
    icon: <Vote className="h-6 w-6 text-green-600" />,
  },
  {
    title: "Purchase & Delivery",
    description:
      "Winners are contacted for shipping information, gifts are purchased using treasury funds and delivered as holiday gifts.",
    icon: <Gift className="h-6 w-6 text-rose-500" />,
  },
];

const stakingFeatures = [
  {
    title: "Stake a $WISH",
    description:
      "Lock your $WISH tokens in the staking contract to earn rewards over time. Your tokens remain yours and can be withdrawn at any time.",
    icon: <Beef className="h-6 w-6 text-blue-500" />,
  },
  {
    title: "Earn Staking Rewards",
    description:
      "Staked tokens automatically earn rewards from the reward pool. The longer you stake, the more rewards you accumulate.",
    icon: <Coins className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: "Stake to Burn",
    description:
      "For every 24 hours you stake, you earn the ability to burn an amount equal to your staked balance from the reward pool. This creates a deflationary mechanism that reduces total supply.",
    icon: <Flame className="h-6 w-6 text-orange-500" />,
  },
  {
    title: "Community-Driven Supply",
    description:
      "The burn mechanism gives holders the power to reduce circulating supply, potentially increasing scarcity while supporting the holiday gifting mission.",
    icon: <HandCoins className="h-6 w-6 text-rose-500" />,
  },
];

const participationPrinciples = [
  {
    title: "No Investment Product",
    description:
      "$WISH is not an investment. There is no founder profit and no promise of returns. This is a seasonal experiment—participate only if the gifting mission resonates with you.",
  },
  {
    title: "No Guaranteed Gifts",
    description:
      "Selection is not guaranteed. The number of gifts depends entirely on trading volume and fee revenue. Low trading volume may result in few or no gifts. Set low expectations.",
  },
  {
    title: "Transparent & Community-First",
    description:
      "All fees, selection processes, and decisions are transparent. Random selection via Chainlink VRF ensures fairness, and optional governance keeps the community involved.",
  },
];

export default function WishPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center space-y-4 mb-12">
          <div className="flex justify-center items-center gap-4">
            <span aria-label="sparkles" className="text-4xl" role="img">
              ✨
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-outlined">
              $WISH Token Mechanics
            </h1>
            <span aria-label="gift" className="text-4xl" role="img">
              🎁
            </span>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            $WISH is a one-time seasonal experiment that transforms trading
            activity into surprise holiday gifting. Trading fees fund real gifts
            for randomly selected wishlist participants. Stake your tokens to
            earn rewards and unlock the ability to burn tokens, creating
            deflationary pressure. No founder profit, no promises of return,
            just a magical onchain holiday celebration.
          </p>
        </div>

        <Card className="border-accent/30 shadow-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
              <HandHeart className="h-7 w-7 text-rose-500" />A Holiday Gifting
              Experiment
            </CardTitle>
            <CardDescription className="text-base md:text-lg">
              This is a one-time seasonal experiment designed to transform
              speculative trading revenues into real holiday gifts. Trading fees
              from $WISH token activity are collected in ETH and used
              exclusively to purchase and deliver gifts to randomly selected
              wishlist participants. No founder profit, no token sale, and no
              guarantees— just a transparent, community-first celebration of
              generosity.
            </CardDescription>
          </CardHeader>
        </Card>

        <section className="mt-16 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-outlined">
              Acquire $WISH Tokens
            </h2>
            <Buy />
          </div>
        </section>

        <section className="mt-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold text-outlined">
              Staking & Deflationary Mechanism
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              $WISH holders can stake their tokens to earn rewards and
              participate in a unique deflationary burn mechanism that reduces
              circulating supply over time.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {stakingFeatures.map(feature => (
              <Card
                key={feature.title}
                className="h-full border-accent/20 shadow-sm hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm mt-2">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="border-accent/30 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">
                How the Burn Mechanism Works
              </CardTitle>
              <CardDescription className="text-base space-y-3 mt-4">
                <p>
                  <strong>1. Stake Your Tokens:</strong> Lock your $WISH tokens
                  in the staking contract and opt-in to burn tracking.
                </p>
                <p>
                  <strong>2. Accumulate Burn Allowance:</strong> For every
                  complete 24-hour period you stake, you earn the right to burn
                  tokens equal to your staked amount. Example: Stake 1,000 $WISH
                  for 3 days = ability to burn up to 3,000 tokens from the
                  reward pool.
                </p>
                <p>
                  <strong>3. Burn Tokens:</strong> Use your accumulated burn
                  allowance to permanently remove tokens from circulation,
                  creating deflationary pressure.
                </p>
                <p>
                  <strong>4. Withdraw Anytime:</strong> Your staked tokens
                  remain yours and can be withdrawn at any time after claiming
                  rewards.
                </p>
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="mt-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold text-outlined">
              How Governance Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our governance process combines cryptographic randomness with
              community voting to ensure trading fees become thoughtful gifts
              for deserving community members.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {governanceSteps.map(step => (
              <Card
                key={step.title}
                className="h-full border-accent/20 shadow-sm hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    {step.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="text-sm mt-2">
                      {step.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl">
                Timeline & How It Works
              </CardTitle>
              <CardDescription className="text-base">
                This is a seasonal experiment with clear deadlines and a
                transparent process. The number of winners depends entirely on
                trading volume and fee revenue collected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm md:text-base text-muted-foreground">
              <p>
                • <strong>Wishlist Creation Deadline:</strong> November 30,
                2025. Submit your wishlist through the Base miniapp before this
                date to be eligible.
              </p>
              <p>
                • <strong>Winner Selection:</strong> December 1, 2025. Winners
                are randomly selected via rofl.house using Chainlink VRF. Only
                users with a Neynar score of 0.9+ are eligible.
              </p>
              <p>
                • <strong>Number of Winners:</strong> Depends on trading fees
                collected. Low trading volume means fewer or possibly no gifts.
              </p>
              <p>
                • <strong>Optional Governance:</strong> If needed, $WISH holders
                may vote on which gifts to purchase from winners&apos; lists or
                how to handle unreachable winners.
              </p>
              <p>
                • <strong>Gift Delivery:</strong> Winners are contacted for
                shipping information, gifts are purchased with treasury funds,
                and shipped as holiday surprises.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-semibold text-outlined">
              Responsible Participation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              $WISH token governance invites thoughtful participation without
              promising any financial gain. Please review these guiding
              principles before getting involved.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {participationPrinciples.map(principle => (
              <Card
                key={principle.title}
                className="h-full border-accent/20 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{principle.title}</CardTitle>
                  <CardDescription className="text-sm mt-3">
                    {principle.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-muted/50 rounded-xl p-8 space-y-4 mt-8">
          <h2 className="text-2xl font-semibold">
            Important: This Is An Experiment
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            $WISH is a <strong>one-time seasonal experiment</strong> with no
            guarantees. Do not expect any financial return, and never feel
            pressured to acquire tokens. The number of gifts depends entirely on
            trading volume—low volume means few or no gifts. Selection is not
            guaranteed, and funds may not suffice for many recipients.
          </p>
          <p className="text-muted-foreground text-sm md:text-base">
            <strong>What $WISH is:</strong> A transparent, community-first way
            to transform trading activity into holiday surprises for randomly
            selected wishlist participants, featuring a unique staking and
            deflationary burn mechanism that gives holders the power to reduce
            circulating supply.
          </p>
          <p className="text-muted-foreground text-sm md:text-base">
            <strong>What $WISH is not:</strong> An investment product, a promise
            of profit, or a guarantee of receiving gifts. If executed cleanly
            with full transparency, this could make for a magical onchain
            holiday season—but please set low expectations and participate only
            if the mission resonates with you.
          </p>
        </section>
      </main>
    </div>
  );
}
