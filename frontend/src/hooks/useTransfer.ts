import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FTK_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

export function useTransfer() {
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

  const transfer = (to: `0x${string}`, amount: bigint) =>
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: FTK_ABI,
      functionName: "transfer",
      args: [to, amount],
    });

  return { transfer, hash, isPending, isConfirming, isSuccess, error, reset };
}
