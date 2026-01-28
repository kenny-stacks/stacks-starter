"use client";

import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect";

interface HiroWallet {
  isWalletOpen: boolean;
  isWalletConnected: boolean;
  testnetAddress: string | null;
  mainnetAddress: string | null;
  authenticate: () => void;
  disconnect: () => void;
}

const HiroWalletContext = createContext<HiroWallet>({
  isWalletOpen: false,
  isWalletConnected: false,
  testnetAddress: null,
  mainnetAddress: null,
  authenticate: () => {},
  disconnect: () => {},
});
export default HiroWalletContext;

interface ProviderProps {
  children: ReactNode | ReactNode[];
}
export const HiroWalletProvider: FC<ProviderProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  useEffect(() => {
    setMounted(true);
    setIsWalletConnected(isConnected());
  }, [mounted]);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const authenticate = useCallback(async () => {
    try {
      setIsWalletOpen(true);
      await connect();
      setIsWalletOpen(false);
      setIsWalletConnected(isConnected());
    } catch (error) {
      console.error('Connection failed:', error);
      setIsWalletOpen(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsWalletConnected(false);
  }, []);

  const { testnetAddress, mainnetAddress } = useMemo(() => {
    if (!isWalletConnected) return { testnetAddress: null, mainnetAddress: null };
    
    const data = getLocalStorage();
    const stxAddresses = data?.addresses?.stx || [];
    
    // On connect there is only 1 address, which is the current address
    const address = stxAddresses.length > 0 ? stxAddresses[0].address : null;
    
    const isTestnet = address?.startsWith('ST');
    const isMainnet = address?.startsWith('SP');
    
    return {
      testnetAddress: isTestnet ? address : null,
      mainnetAddress: isMainnet ? address : null,
    };
  }, [isWalletConnected]);

  const hiroWalletContext = useMemo(
    () => ({
      authenticate,
      disconnect: handleDisconnect,
      isWalletOpen,
      isWalletConnected,
      testnetAddress,
      mainnetAddress,
    }),
    [
      authenticate,
      handleDisconnect,
      isWalletOpen,
      isWalletConnected,
      mainnetAddress,
      testnetAddress,
    ]
  );

  return (
    <HiroWalletContext.Provider value={hiroWalletContext}>
      {children}
    </HiroWalletContext.Provider>
  );
};
