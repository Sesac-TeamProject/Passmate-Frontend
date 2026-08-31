"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createQueryClient } from "@/lib/queries/query-client";

type Props = { children: React.ReactNode };

/** 루트 레이아웃에서 한 번 감싼다. QueryClient는 요청(클라이언트)마다 하나씩 만든다. */
export function QueryProvider({ children }: Props) {
  const [client] = useState(createQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
