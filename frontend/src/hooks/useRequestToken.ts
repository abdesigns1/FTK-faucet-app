import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FTK_ABI, CONTRACT_ADDRESS } from "@/lib/contract";

export function useRequestToken() {
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

  const requestToken = () =>
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: FTK_ABI,
      functionName: "requestToken",
    });

  return {
    requestToken,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}
