import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTokenData } from "@/hooks/useTokenData";
import { useRequestToken } from "@/hooks/useRequestToken";
import { useMint } from "@/hooks/useMint";
import { useTransfer } from "@/hooks/useTransfer";
import { useCooldownTimer } from "@/hooks/useCooldownTimer";
import { formatToken, shortAddress, parseTokenAmount } from "@/lib/utils";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import {
  StatCard,
  TxButton,
  FieldInput,
  StatusBanner,
  CardSection,
  Spinner,
} from "@/components/ui";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const token = useTokenData();
  const req = useRequestToken();
  const mint = useMint();
  const transfer = useTransfer();
  const { display: cdDisplay, expired: cdExpired } = useCooldownTimer(
    token.cooldown,
  );

  const [mintTo, setMintTo] = useState("");
  const [mintAmt, setMintAmt] = useState("");
  const [txTo, setTxTo] = useState("");
  const [txAmt, setTxAmt] = useState("");

  useEffect(() => {
    if (req.isSuccess || mint.isSuccess || transfer.isSuccess) {
      const t = setTimeout(() => token.refetch(), 2000);
      return () => clearTimeout(t);
    }
  }, [req.isSuccess, mint.isSuccess, transfer.isSuccess]);

  const isOwner =
    !!address &&
    !!token.ownerAddress &&
    address.toLowerCase() === token.ownerAddress.toLowerCase();

  const supplyPct =
    token.maxSupply > 0n
      ? Number((token.totalSupply * 10_000n) / token.maxSupply) / 100
      : 0;

  return (
    <div className="min-h-screen bg-[#0c1117] text-white font-sans">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-white/[0.07] bg-[#0c1117]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#00ccaa] flex items-center justify-center font-black text-[#0a0a0a] text-sm select-none">
              F
            </div>
            <div className="leading-tight">
              <div className="font-bold text-sm tracking-wide">
                FTK Dashboard
              </div>
              <div className="text-[10px] font-mono tracking-widest text-[#00ff88]/60 uppercase">
                Sepolia Testnet
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/35 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              Live
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard
            label="Your Balance"
            value={isConnected ? `${formatToken(token.balance)} FTK` : "—"}
            accent
            loading={token.isLoading}
          />
          <StatCard
            label="Total Supply"
            value={`${formatToken(token.totalSupply)} FTK`}
            loading={token.isLoading}
          />
          <StatCard
            label="Max Supply"
            value={`${formatToken(token.maxSupply)} FTK`}
            loading={token.isLoading}
          />
          <StatCard
            label="Remaining"
            value={`${formatToken(token.remainingSupply)} FTK`}
            sub={`${(100 - supplyPct).toFixed(2)}% free`}
            loading={token.isLoading}
          />
          <StatCard
            label="Your Address"
            value={isConnected && address ? shortAddress(address) : "—"}
            sub={isOwner ? "✦ Contract Owner" : undefined}
            loading={token.isLoading}
          />
        </div>

        {/* Supply Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">
              Supply Usage
            </span>
            <span className="text-xs font-mono text-white/35">
              {supplyPct.toFixed(2)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00ff88] to-[#00ccaa] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${supplyPct}%` }}
            />
          </div>
        </div>

        {/* Not connected */}
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-white/25">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-4xl">
              ⬡
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/40">
                Connect your wallet
              </p>
              <p className="text-xs mt-1">to interact with FaucetToken (FTK)</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Faucet */}
            <CardSection
              icon="⬡"
              title="Faucet"
              sub="Claim 100 FTK — once every 24 hours"
            >
              {cdExpired ? (
                <div className="flex items-center gap-2.5 rounded-xl bg-[#00ff88]/[0.08] border border-[#00ff88]/25 px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shrink-0" />
                  <span className="text-sm text-[#00ff88]">Ready to claim</span>
                </div>
              ) : (
                <div className="rounded-xl bg-yellow-400/[0.07] border border-yellow-400/20 px-4 py-4">
                  <p className="text-[10px] font-mono tracking-widest uppercase text-yellow-400/60 mb-1">
                    Cooldown Active
                  </p>
                  <p className="text-2xl font-bold font-mono text-yellow-300 leading-tight">
                    retry in {cdDisplay}
                  </p>
                </div>
              )}
              <TxButton
                onClick={req.requestToken}
                loading={req.isPending || req.isConfirming}
                disabled={!cdExpired}
                variant="primary"
                className="w-full"
              >
                Request 100 FTK
              </TxButton>
              <StatusBanner
                hash={req.hash}
                isConfirming={req.isConfirming}
                isSuccess={req.isSuccess}
                error={req.error}
              />
            </CardSection>

            {/* Transfer */}
            <CardSection
              icon="→"
              title="Transfer"
              sub="Send FTK to any wallet address"
            >
              <div className="flex flex-col gap-3">
                <FieldInput
                  label="Recipient Address"
                  placeholder="0x…"
                  value={txTo}
                  onChange={setTxTo}
                />
                <FieldInput
                  label="Amount (FTK)"
                  placeholder="e.g. 50"
                  value={txAmt}
                  onChange={setTxAmt}
                  type="number"
                />
              </div>
              <TxButton
                onClick={() => {
                  const amt = parseTokenAmount(txAmt);
                  if (!amt || !txTo.startsWith("0x")) return;
                  transfer.transfer(txTo as `0x${string}`, amt);
                }}
                loading={transfer.isPending || transfer.isConfirming}
                disabled={!txTo || !txAmt}
                variant="secondary"
                className="w-full"
              >
                Send FTK →
              </TxButton>
              <StatusBanner
                hash={transfer.hash}
                isConfirming={transfer.isConfirming}
                isSuccess={transfer.isSuccess}
                error={transfer.error}
              />
            </CardSection>

            {/* Mint — owner only */}
            {isOwner && (
              <CardSection
                icon="✦"
                title="Mint"
                sub="Owner only — mint tokens to any address"
                ownerAccent
              >
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00ff88]/80 bg-[#00ff88]/10 border border-[#00ff88]/20 px-2.5 py-1 rounded-full w-fit">
                  ✦ Owner Access
                </div>
                <div className="flex flex-col gap-3">
                  <FieldInput
                    label="Recipient Address"
                    placeholder="0x…"
                    value={mintTo}
                    onChange={setMintTo}
                  />
                  <FieldInput
                    label="Amount (FTK)"
                    placeholder="e.g. 1000"
                    value={mintAmt}
                    onChange={setMintAmt}
                    type="number"
                  />
                </div>
                <TxButton
                  onClick={() => {
                    const amt = parseTokenAmount(mintAmt);
                    if (!amt || !mintTo.startsWith("0x")) return;
                    mint.mint(mintTo as `0x${string}`, amt);
                  }}
                  loading={mint.isPending || mint.isConfirming}
                  disabled={!mintTo || !mintAmt}
                  variant="owner"
                  className="w-full"
                >
                  Mint FTK ✦
                </TxButton>
                <StatusBanner
                  hash={mint.hash}
                  isConfirming={mint.isConfirming}
                  isSuccess={mint.isSuccess}
                  error={mint.error}
                />
              </CardSection>
            )}

            {/* Token Info */}
            <CardSection icon="ℹ" title="Token Info" sub="On-chain read data">
              {token.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-white/30 py-4">
                  <Spinner />
                  Loading…
                </div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {[
                      ["Name", token.name],
                      ["Symbol", token.symbol],
                      ["Decimals", String(token.decimals)],
                      ["Contract", shortAddress(CONTRACT_ADDRESS)],
                      ["Owner", shortAddress(token.ownerAddress)],
                      ["Network", "Sepolia"],
                    ].map(([k, v]) => (
                      <tr
                        key={k}
                        className="border-b border-white/[0.05] last:border-0"
                      >
                        <td className="py-2.5 text-white/40 w-[42%] text-xs">
                          {k}
                        </td>
                        <td className="py-2.5 font-mono text-white/75 text-xs">
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardSection>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
          <span className="text-white/20">
            FaucetToken (FTK) · Sepolia Testnet
          </span>

          <a>{shortAddress(CONTRACT_ADDRESS)} ↗</a>
        </div>
      </footer>
    </div>
  );
}
