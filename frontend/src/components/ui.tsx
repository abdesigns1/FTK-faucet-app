import React from "react";

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  sub,
  accent,
  loading,
}: StatCardProps) {
  return (
    <div
      className={[
        "flex flex-col gap-1.5 rounded-2xl p-5 transition-all duration-300",
        accent
          ? "bg-gradient-to-br from-[#00ff88]/10 to-[#00ff88]/[0.03] border border-[#00ff88]/30"
          : "bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05]",
      ].join(" ")}
    >
      <span className="text-[10px] font-mono tracking-widest uppercase text-white/40">
        {label}
      </span>
      {loading ? (
        <div className="h-7 w-32 bg-white/10 rounded-lg animate-pulse" />
      ) : (
        <span
          className={[
            "text-2xl font-bold leading-tight",
            accent ? "text-[#00ff88]" : "text-white",
          ].join(" ")}
        >
          {value}
        </span>
      )}
      {sub && <span className="text-xs text-white/35 font-mono">{sub}</span>}
    </div>
  );
}

// ─── TxButton ─────────────────────────────────────────────────────────────────
type Variant = "primary" | "secondary" | "owner";

interface TxButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

export function TxButton({
  onClick,
  disabled,
  loading,
  children,
  variant = "primary",
  className = "",
}: TxButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-150 select-none";

  const variants: Record<Variant, string> = {
    primary:
      "bg-[#00ff88] text-[#0a0a0a] hover:bg-[#00e87a] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
    secondary:
      "bg-white/[0.07] text-white border border-white/10 hover:bg-white/[0.12] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
    owner:
      "bg-gradient-to-r from-[#00ff88] to-[#00ccaa] text-[#0a0a0a] hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={[base, variants[variant], className].join(" ")}
    >
      {loading ? (
        <>
          <Spinner />
          Processing…
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ─── FieldInput ───────────────────────────────────────────────────────────────
interface FieldInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}

export function FieldInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: FieldInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono tracking-widest uppercase text-white/40">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff88]/50 transition-colors duration-150 font-mono"
      />
    </div>
  );
}

// ─── StatusBanner ─────────────────────────────────────────────────────────────
interface StatusBannerProps {
  hash?: string;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export function StatusBanner({
  hash,
  isConfirming,
  isSuccess,
  error,
}: StatusBannerProps) {
  if (!hash && !error) return null;

  if (error) {
    const msg = error.message.includes("CooldownNotElapsed")
      ? "Cooldown not elapsed — wait for your timer to expire."
      : error.message.includes("ExceedsMaxSupply")
        ? "Amount would exceed the max supply cap."
        : error.message.includes("User rejected") ||
            error.message.includes("user rejected")
          ? "Transaction rejected by user."
          : error.message.slice(0, 90);

    return (
      <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
        <span className="mt-0.5 shrink-0">✗</span>
        <span>{msg}</span>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-yellow-400/10 border border-yellow-400/20 px-4 py-3 text-sm text-yellow-300">
        <Spinner className="text-yellow-300" />
        Confirming on-chain…
      </div>
    );
  }

  if (isSuccess && hash) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 px-4 py-3 text-sm text-[#00ff88]">
        <span>✓ Transaction confirmed!</span>
        href={`https://sepolia.etherscan.io/tx/${hash}`}
        target="_blank" rel="noopener noreferrer" className="underline
        text-[#00cc6a] hover:text-[#00ff88] transition-colors"
        <a>Etherscan ↗</a>
      </div>
    );
  }

  return null;
}

// ─── CardSection ──────────────────────────────────────────────────────────────
interface CardSectionProps {
  icon: string;
  title: string;
  sub: string;
  children: React.ReactNode;
  ownerAccent?: boolean;
}

export function CardSection({
  icon,
  title,
  sub,
  children,
  ownerAccent,
}: CardSectionProps) {
  return (
    <section
      className={[
        "bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4",
        ownerAccent
          ? "border-[#00ff88]/25 bg-gradient-to-b from-[#00ff88]/[0.04] to-transparent"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl text-[#00ff88] leading-none mt-0.5">
          {icon}
        </span>
        <div>
          <h2 className="font-bold text-white text-base leading-tight">
            {title}
          </h2>
          <p className="text-xs text-white/40 mt-0.5">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={["animate-spin h-4 w-4", className].join(" ")}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
