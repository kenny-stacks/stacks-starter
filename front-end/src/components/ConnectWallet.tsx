"use client";
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { useContext } from "react";
import HiroWalletContext from "./HiroWalletProvider";
import { formatStxAddress } from "@/lib/address-utils";

interface ConnectWalletButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

export const ConnectWalletButton = (buttonProps: ConnectWalletButtonProps) => {
  const { children } = buttonProps;
  const {
    authenticate,
    isWalletConnected,
    mainnetAddress,
    testnetAddress,
    disconnect,
  } = useContext(HiroWalletContext);
  const currentWalletAddress =
    process.env.NEXT_PUBLIC_STACKS_NETWORK === "testnet"
      ? testnetAddress
      : mainnetAddress;

  return isWalletConnected ? (
    <Menu>
      <MenuButton as={Button} size="sm" colorScheme="gray">
        <Flex gap="2" align="center">
          <Box>Connected:</Box>
          <Box>{formatStxAddress(currentWalletAddress || "")}</Box>
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuItem onClick={disconnect}>Disconnect Wallet</MenuItem>
      </MenuList>
    </Menu>
  ) : (
    <Button
      size="sm"
      onClick={authenticate}
      data-testid="wallet-connect-button"
      {...buttonProps}
    >
      <Flex gap="2" align="center">
        {children || "Connect Wallet"}
      </Flex>
    </Button>
  );
};
