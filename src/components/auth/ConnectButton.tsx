import { useTheme } from "next-themes";
import { type FC } from "react";
import {
  AccountAddress,
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
  ConnectButton as ThirdwebConnectButton,
  darkTheme,
  lightTheme,
  useActiveWallet,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";
import { createWallet, inAppWallet } from "thirdweb/wallets";

import { appDescription, appName, chain } from "@/constants";
import { useAuthToken } from "@/hooks/useAuthToken";
import { client } from "@/providers/Thirdweb";

import { Button } from "../ui/button";

export const ConnectButton: FC = () => {
  const { resolvedTheme } = useTheme();
  const wallet = useActiveWallet();
  const { setToken, clearToken } = useAuthToken();

  const wallets = [
    inAppWallet({
      auth: {
        options: ["x", "telegram", "coinbase", "google", "email", "phone"],
      },
    }),
    createWallet("com.coinbase.wallet"),
    createWallet("io.metamask"),
    createWallet("me.rainbow"),
    createWallet("app.phantom"),
  ];

  return (
    <ThirdwebConnectButton
      autoConnect={true}
      chain={chain}
      client={client}
      wallets={wallets}
      appMetadata={{
        name: appName,
        description: appDescription,
      }}
      auth={{
        isLoggedIn: async (address: string) => {
          console.log("[isLoggedIn] Checking auth for address:", address);

          // Check localStorage directly for the most up-to-date token
          const storedToken =
            typeof window !== "undefined"
              ? localStorage.getItem("wishlist_auth_token")
              : null;

          console.log("[isLoggedIn] Token found:", !!storedToken);

          if (!storedToken) {
            console.log("[isLoggedIn] No token found in localStorage");
            return false;
          }

          try {
            const response = await fetch("/api/auth/me", {
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            });

            console.log("[isLoggedIn] API response status:", response.status);

            if (!response.ok) {
              console.log("[isLoggedIn] Auth check failed:", response.status);
              return false;
            }

            const data = await response.json();
            console.log("[isLoggedIn] Auth response data:", data);
            console.log("[isLoggedIn] Comparing addresses:", {
              fromJWT: data.address,
              expected: address.toLowerCase(),
              match: data.address === address.toLowerCase(),
            });
            const isValid =
              data.isLoggedIn && data.address === address.toLowerCase();
            console.log(
              "[isLoggedIn] Final result:",
              isValid,
              "for address:",
              address,
            );
            return isValid;
          } catch (error) {
            console.error("[isLoggedIn] Error checking login status:", error);
            return false;
          }
        },
        doLogin: async params => {
          try {
            console.log("doLogin called with params:", {
              payload: params.payload,
              signature: params.signature?.slice(0, 20) + "...",
            });

            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payload: params.payload,
                signature: params.signature,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to login");
            }

            const data = await response.json();
            setToken(data.token);
            console.log("Login successful, token saved");
          } catch (error) {
            console.error("Error logging in:", error);
            throw error;
          }
        },
        getLoginPayload: async ({ address }) => {
          try {
            const response = await fetch(`/api/auth/login?address=${address}`);

            if (!response.ok) {
              throw new Error("Failed to get login payload");
            }

            const data = await response.json();
            return data.payload;
          } catch (error) {
            console.error("Error getting login payload:", error);
            throw error;
          }
        },
        doLogout: async () => {
          console.log("[doLogout] Logout called");
          try {
            await fetch("/api/auth/logout", {
              method: "POST",
            });
            clearToken();
            console.log("[doLogout] Token cleared");
          } catch (error) {
            console.error("[doLogout] Error logging out:", error);
          }
        },
      }}
      connectButton={{
        label: "Login",
        className: "!size-9 !min-w-20 !mr-2",
      }}
      connectModal={{
        title: `Login to ${appName}`,
        showThirdwebBranding: false,
      }}
      detailsButton={{
        render: () => (
          <AccountProvider
            address={wallet?.getAccount()?.address ?? ""}
            client={client}
          >
            <Button className="flex items-center gap-2" variant="outline">
              <AccountAvatar
                className="!size-6 rounded-full"
                fallbackComponent={
                  <Blobbie
                    address={wallet?.getAccount()?.address ?? ""}
                    className="!size-6 rounded-full"
                  />
                }
              />
              <AccountName
                fallbackComponent={
                  <AccountAddress formatFn={addr => shortenAddress(addr)} />
                }
              />
            </Button>
          </AccountProvider>
        ),
      }}
      signInButton={{
        label: "Sign In",
        className: "!size-9 !min-h-0 !min-w-30 !mr-2",
      }}
      theme={
        resolvedTheme === "dark"
          ? darkTheme({
              colors: { connectedButtonBg: "var(--background)" },
            })
          : lightTheme({
              colors: { connectedButtonBg: "var(--background)" },
            })
      }
    />
  );
};
