"use client";

import theme from "@/theme";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { DevnetWalletProvider } from "../DevnetWalletProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HiroWalletProvider } from "../HiroWalletProvider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode="light" />
        <HiroWalletProvider>
          <DevnetWalletProvider>{children}</DevnetWalletProvider>
        </HiroWalletProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
