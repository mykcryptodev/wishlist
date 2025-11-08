export interface NeynarUser {
  object: string;
  fid: number;
  username: string;
  display_name: string;
  custody_address: string;
  pfp_url?: string;
  profile: {
    bio?: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses?: {
    eth_addresses: string[];
    sol_addresses: string[];
    primary?: {
      eth_address?: string;
    };
  };
  power_badge?: boolean;
  score?: number;
}

export interface NeynarApiResponse {
  [address: string]: NeynarUser[];
}

export interface NeynarBulkResponse {
  users: NeynarUser[];
}
