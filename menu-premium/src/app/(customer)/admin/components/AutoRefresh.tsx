"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AutoRefresh({ interval = 15000 }: { interval?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      // router.refresh() revalida a página no servidor silenciosamente
      // sem piscar a tela e sem perder a posição do scroll!
      router.refresh();
    }, interval);

    return () => clearInterval(timer);
  }, [router, interval]);

  return null; // É um componente invisível
}