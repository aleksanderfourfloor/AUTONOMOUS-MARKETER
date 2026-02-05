"use client";

import * as React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-lg border border-zinc-200 bg-white p-4 shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
      {children}
    </h3>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : variant === "secondary"
      ? "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
      : "text-zinc-700 hover:bg-zinc-100";
  return (
    <button
      type={type}
      onClick={onClick}
      className={[base, styles].join(" ")}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-zinc-600">{label}</div>
      <input
        required={required}
        type={type}
        className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-zinc-600">{label}</div>
      <textarea
        className="w-full rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

export function Pill({
  children,
  color = "zinc",
}: {
  children: React.ReactNode;
  color?: "zinc" | "blue" | "emerald" | "amber" | "red";
}) {
  const styles =
    color === "blue"
      ? "bg-blue-50 text-blue-700"
      : color === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : color === "amber"
      ? "bg-amber-50 text-amber-800"
      : color === "red"
      ? "bg-red-50 text-red-700"
      : "bg-zinc-100 text-zinc-700";
  return (
    <span className={["inline-flex rounded-full px-2 py-0.5 text-xs", styles].join(" ")}>
      {children}
    </span>
  );
}

