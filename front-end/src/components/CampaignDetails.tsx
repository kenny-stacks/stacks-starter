"use client";
import {
  Container,
  Box,
  IconButton,
  Image,
  Text,
  Flex,
  useBreakpointValue,
  Heading,
  Progress,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertTitle,
  AlertDescription,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon } from "@chakra-ui/icons";
import { useContext, useEffect, useState } from "react";
import { CAMPAIGN_SUBTITLE, CAMPAIGN_TITLE } from "@/constants/campaign";
import StyledMarkdown from "./StyledMarkdown";
import { useCampaignInfo, useExistingDonation } from "@/hooks/campaignQueries";
import { useCurrentBtcBlock } from "@/hooks/chainQueries";
import { format } from "timeago.js";
import DonationModal from "./DonationModal";
import HiroWalletContext from "./HiroWalletProvider";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import {
  isDevnetEnvironment,
  isTestnetEnvironment,
} from "@/lib/contract-utils";
import { satsToSbtc, useCurrentPrices, ustxToStx } from "@/lib/currency-utils";
import { FUNDRAISING_CONTRACT } from "@/constants/contracts";
import { getRefundTx } from "@/lib/campaign-utils";
import { getStacksNetworkString } from "@/lib/stacks-api";
import useTransactionExecuter from "@/hooks/useTransactionExecuter";
import CampaignAdminControls from "./CampaignAdminControls";

export default function CampaignDetails({
  images,
  markdownContent,
}: {
  images: string[];
  markdownContent: string;
}) {
  const { mainnetAddress, testnetAddress } = useContext(HiroWalletContext);
  const { currentWallet: devnetWallet } = useDevnetWallet();
  const currentWalletAddress = isDevnetEnvironment()
    ? devnetWallet?.stxAddress
    : isTestnetEnvironment()
    ? testnetAddress
    : mainnetAddress;

  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const slideSize = useBreakpointValue({ base: "100%", md: "500px" });

  const { data: currentPrices } = useCurrentPrices();
  const { data: campaignInfo, error: campaignFetchError } =
    useCampaignInfo(currentPrices);
  const { data: currentBlock } = useCurrentBtcBlock();

  const campaignIsUninitialized = campaignInfo?.start === 0;
  const campaignIsExpired = !campaignIsUninitialized && campaignInfo?.isExpired;
  const campaignIsCancelled =
    !campaignIsUninitialized && campaignInfo?.isCancelled;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const progress = campaignInfo
    ? (campaignInfo.usdValue / campaignInfo.goal) * 100
    : 0;

  const blocksLeft = campaignInfo ? campaignInfo?.end - (currentBlock || 0) : 0;
  const secondsLeft = blocksLeft * 600; // estimate each block is 10 minutes
  const secondsLeftTimestamp = new Date(Date.now() - secondsLeft * 1000);

  const { data: previousDonation } = useExistingDonation(currentWalletAddress);

  const hasMadePreviousDonation =
    previousDonation &&
    (previousDonation?.stxAmount > 0 || previousDonation?.sbtcAmount > 0);

  const executeTx = useTransactionExecuter();

  const handleRefund = async () => {
    const txOptions = getRefundTx(
      getStacksNetworkString(),
      currentWalletAddress || ""
    );
    await executeTx(
      txOptions,
      devnetWallet,
      "Refund requested",
      "Refund not requested"
    );
  };

  return (
    <Container maxW="container.xl" py="8">
      <Flex direction="column" gap="6">
        <Flex direction="column" gap="1">
          <Heading>{CAMPAIGN_TITLE}</Heading>
          <Text>{CAMPAIGN_SUBTITLE}</Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
          {/* Left column: Image carousel */}
          <Box position="relative" width="full" overflow="hidden">
            <Flex width={slideSize} mx="auto" position="relative">
              <Image
                src={images[currentIndex]}
                alt={`Campaign image ${currentIndex + 1}`}
                objectFit="cover"
                width="full"
                height="auto"
              />
              <IconButton
                aria-label="Previous image"
                icon={<ChevronLeftIcon boxSize="5" />}
                onClick={prevSlide}
                position="absolute"
                left="2"
                top="50%"
                transform="translateY(-50%)"
                colorScheme="gray"
                rounded="full"
              />
              <IconButton
                aria-label="Next image"
                icon={<ChevronRightIcon boxSize="5" />}
                onClick={nextSlide}
                position="absolute"
                right="2"
                top="50%"
                transform="translateY(-50%)"
                colorScheme="gray"
                rounded="full"
              />
              <Text
                position="absolute"
                bottom="2"
                right="2"
                bg="blackAlpha.700"
                color="white"
                px="2"
                py="1"
                rounded="md"
                fontSize="sm"
              >
                {currentIndex + 1} / {images.length}
              </Text>
            </Flex>
          </Box>

          {/* Right column: Campaign stats & donation */}
          <Box>
            {campaignInfo &&
            currentWalletAddress === FUNDRAISING_CONTRACT.address ? (
              <CampaignAdminControls
                campaignIsUninitialized={campaignIsUninitialized}
                campaignIsExpired={!!campaignIsExpired}
                campaignIsCancelled={!!campaignIsCancelled}
                campaignIsWithdrawn={!!campaignInfo?.isWithdrawn}
              />
            ) : null}
            <Box p={6} borderRadius="lg" borderWidth="1px">
              {campaignIsUninitialized ? (
                <Flex direction="column" gap="4">
                  This campaign hasn&apos;t started yet!
                </Flex>
              ) : null}

              {campaignInfo && !campaignIsUninitialized ? (
                <Flex direction="column" gap={6}>
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>Raised</StatLabel>
                      <StatNumber>
                        $
                        {campaignInfo?.usdValue?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </StatNumber>
                      <StatHelpText>
                        of ${campaignInfo?.goal?.toLocaleString()} goal
                      </StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Contributions</StatLabel>
                      <StatNumber>{campaignInfo?.donationCount}</StatNumber>
                      <StatHelpText>
                        {campaignIsExpired ? (
                          <Flex direction="column">
                            <Box>
                              Campaign expired
                              <Tooltip
                                label={
                                  <Flex direction="column" gap="1">
                                    <Box>
                                      Expired at: Block #{campaignInfo?.end}
                                    </Box>
                                    <Box>Current: Block #{currentBlock}</Box>
                                  </Flex>
                                }
                              >
                                <InfoIcon ml="1.5" mt="-3px" />
                              </Tooltip>
                            </Box>
                          </Flex>
                        ) : (
                          <Flex direction="column">
                            <Box>
                              {blocksLeft.toLocaleString()} BTC blocks left
                              <Tooltip
                                label={
                                  <Flex direction="column" gap="1">
                                    <Box>
                                      Started: Block #{campaignInfo?.start}
                                    </Box>
                                    <Box>Ends: Block #{campaignInfo?.end}</Box>
                                    <Box>Current: Block #{currentBlock}</Box>
                                  </Flex>
                                }
                              >
                                <InfoIcon ml="1.5" mt="-3px" />
                              </Tooltip>
                            </Box>
                            <Box>
                              (About{" "}
                              {format(secondsLeftTimestamp)?.replace(
                                " ago",
                                ""
                              )}
                              )
                            </Box>
                          </Flex>
                        )}
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>

                  <Box>
                    <Progress
                      value={progress}
                      size="lg"
                      colorScheme="green"
                      borderRadius="full"
                    />
                  </Box>

                  {campaignIsExpired || campaignIsCancelled ? (
                    <Flex direction="column" gap="2">
                      <Box>
                        This fundraiser{" "}
                        {campaignIsCancelled ? "was cancelled" : "has ended"}.
                        {campaignIsCancelled
                          ? " Contributors are eligible for a refund."
                          : null}
                      </Box>
                      {hasMadePreviousDonation ? (
                        <Alert mb="4">
                          <Box>
                            <AlertTitle>
                              You contributed to this fundraiser.
                            </AlertTitle>
                            <AlertDescription>
                              <Box>
                                STX:{" "}
                                {Number(
                                  ustxToStx(previousDonation?.stxAmount)
                                ).toFixed(2)}
                              </Box>
                              <Box>
                                sBTC:{" "}
                                {satsToSbtc(
                                  previousDonation?.sbtcAmount
                                ).toFixed(8)}
                              </Box>
                            </AlertDescription>
                            <Box mt="4">
                              {!campaignIsCancelled ? (
                                <Box>Thanks for your contribution!</Box>
                              ) : (
                                <Button
                                  colorScheme="green"
                                  onClick={handleRefund}
                                >
                                  Request a Refund
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Alert>
                      ) : null}
                    </Flex>
                  ) : (
                    <Flex direction="column" gap="4">
                      <Button
                        size="lg"
                        colorScheme="green"
                        width="full"
                        onClick={() => {
                          setIsDonationModalOpen(true);
                        }}
                      >
                        Contribute Now
                      </Button>
                      <Box fontSize="xs">
                        <Box mb="2">
                          <strong>Flexible funding</strong>: Creator keeps
                          whatever money they raise, even if they don&apos;t hit
                          their target. No refunds to backers if the campaign
                          falls short.
                        </Box>
                        <Box>
                          The creator can always choose to cancel this
                          fundraiser and provide refunds.
                        </Box>
                      </Box>
                    </Flex>
                  )}
                </Flex>
              ) : campaignFetchError ? (
                <Box>
                  <Alert status="warning">
                    <Box>
                      <AlertTitle>Campaign Data Unavailable</AlertTitle>
                      <AlertDescription>
                        Unable to retrieve campaign data from the blockchain.
                        This could be due to network issues or the campaign may
                        no longer exist.
                      </AlertDescription>
                    </Box>
                  </Alert>
                </Box>
              ) : !campaignIsUninitialized ? (
                <Box w="full" textAlign="center">
                  <Spinner size="lg" />
                </Box>
              ) : null}
            </Box>
          </Box>
        </SimpleGrid>

        {/* Markdown content */}
        <StyledMarkdown>{markdownContent}</StyledMarkdown>
      </Flex>
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => {
          setIsDonationModalOpen(false);
        }}
      />
    </Container>
  );
}
