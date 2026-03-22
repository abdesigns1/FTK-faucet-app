import { useReadContracts, useAccount } from "wagmi";
import { FTK_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

const base = { address: CONTRACT_ADDRESS, abi: FTK_ABI } as const;
const ZERO = "0x0000000000000000000000000000000000000000" as const;

export interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  maxSupply: bigint;
  remainingSupply: bigint;
  balance: bigint;
  cooldown: bigint;
  ownerAddress: string;
  isLoading: boolean;
  refetch: () => void;
}

export function useTokenData(): TokenData {
  const { address } = useAccount();
  const user = address ?? ZERO;

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...base, functionName: "name" },
      { ...base, functionName: "symbol" },
      { ...base, functionName: "decimals" },
      { ...base, functionName: "totalSupply" },
      { ...base, functionName: "MAX_SUPPLY" },
      { ...base, functionName: "remainingSupply" },
      { ...base, functionName: "balanceOf", args: [user] },
      { ...base, functionName: "cooldownRemaining", args: [user] },
      { ...base, functionName: "owner" },
    ],
    query: { refetchInterval: 12_000 },
  });

  return {
    name: (data?.[0]?.result as string) ?? "FaucetToken",
    symbol: (data?.[1]?.result as string) ?? "FTK",
    decimals: (data?.[2]?.result as number) ?? 18,
    totalSupply: (data?.[3]?.result as bigint) ?? 0n,
    maxSupply: (data?.[4]?.result as bigint) ?? 0n,
    remainingSupply: (data?.[5]?.result as bigint) ?? 0n,
    balance: (data?.[6]?.result as bigint) ?? 0n,
    cooldown: (data?.[7]?.result as bigint) ?? 0n,
    ownerAddress: (data?.[8]?.result as string) ?? "",
    isLoading,
    refetch,
  };
}
