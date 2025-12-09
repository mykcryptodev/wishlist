"use client";

import { useMemo } from "react";
import {
  AccountName,
  type AccountNameProps,
  AccountProvider,
  useSocialProfiles,
} from "thirdweb/react";

import { client } from "@/providers/Thirdweb";

interface AccountDisplayNameProps
  extends Omit<AccountNameProps, "formatFn"> {
  address?: string;
  formatFn?: AccountNameProps["formatFn"];
}

interface FarcasterProfile {
  addresses?: Array<string>;
  bio?: string;
  custodyAddress?: string;
  display?: string;
  fid?: number;
  pfp?: string;
  username?: string;
}

export function AccountDisplayName({
  address,
  formatFn,
  ...rest
}: AccountDisplayNameProps) {
  const { data: socialProfiles } = useSocialProfiles({
    client,
    address,
  });

  const farcasterDisplayName = useMemo(() => {
    if (!socialProfiles?.length) {
      return undefined;
    }

    const farcasterProfile = socialProfiles.find(
      profile => profile.type === "farcaster",
    )?.metadata as FarcasterProfile | undefined;

    const display = farcasterProfile?.display?.trim();
    return display ? display : undefined;
  }, [socialProfiles]);

  const handleFormat: AccountNameProps["formatFn"] = name => {
    const preferredName = farcasterDisplayName ?? name;
    return formatFn ? formatFn(preferredName) : preferredName;
  };

  if (!address) {
    return null;
  }

  return (
    <AccountProvider address={address as `0x${string}`} client={client}>
      <AccountName {...rest} formatFn={handleFormat} />
    </AccountProvider>
  );
}
