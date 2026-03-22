import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FTK_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

export function useMint() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mint = (to: `0x${string}`, amount: bigint) =>
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: FTK_ABI,
      functionName: "mint",
      args: [to, amount],
    });

  return { mint, hash, isPending, isConfirming, isSuccess, error, reset };
}
