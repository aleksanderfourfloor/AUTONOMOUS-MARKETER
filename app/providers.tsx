"use client";

import * as React from "react";
import { AppStoreProvider } from "./state/store";
import { ToastProvider } from "./state/toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppStoreProvider>{children}</AppStoreProvider>
    </ToastProvider>
  );
}

