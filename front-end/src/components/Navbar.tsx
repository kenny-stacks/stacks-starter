"use client";

import { Box, Container, Flex, Link } from "@chakra-ui/react";
import { isDevnetEnvironment } from "@/lib/contract-utils";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { DevnetWalletButton } from "./DevnetWalletButton";
import { ConnectWalletButton } from "./ConnectWallet";

export const Navbar = () => {
  const { currentWallet, wallets, setCurrentWallet } = useDevnetWallet();

  return (
    <Box as="nav" bg="white" boxShadow="sm">
      <Container maxW="container.xl">
        <Flex justify="space-between" h={16} align="center">
          <Flex align="center">
            <Flex
              bg="white"
              borderRadius="md"
              border="2px"
              borderColor="gray.700"
              letterSpacing="-.05em"
              fontSize="xl"
              fontWeight="bold"
              w="52px"
              h="52px"
              justify="center"
              align="center"
              color="gray.900"
              shrink="0"
            >
              /-/
            </Flex>
            <Link href="/" textDecoration="none">
              <Box fontSize="lg" fontWeight="bold" color="gray.900" ml={4}>
                Fundraising
              </Box>
            </Link>
          </Flex>
          <Flex align="center" gap={4}>
            {isDevnetEnvironment() ? (
              <DevnetWalletButton
                currentWallet={currentWallet}
                wallets={wallets}
                onWalletSelect={setCurrentWallet}
              />
            ) : (
              <ConnectWalletButton />
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};
