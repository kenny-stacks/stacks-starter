import useTransactionExecuter from "@/hooks/useTransactionExecuter";
import {
  getCancelTx,
  getInitializeTx,
  getWithdrawTx,
} from "@/lib/campaign-utils";
import {
  isDevnetEnvironment,
  isTestnetEnvironment,
} from "@/lib/contract-utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Tooltip,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import HiroWalletContext from "./HiroWalletProvider";
import { useDevnetWallet } from "@/lib/devnet-wallet-context";
import { getStacksNetworkString } from "@/lib/stacks-api";

export default function CampaignAdminControls({
  campaignIsUninitialized,
  campaignIsCancelled,
  campaignIsExpired,
  campaignIsWithdrawn,
}: {
  campaignIsUninitialized: boolean;
  campaignIsCancelled: boolean;
  campaignIsExpired: boolean;
  campaignIsWithdrawn: boolean;
}) {
  const { mainnetAddress, testnetAddress } = useContext(HiroWalletContext);
  const { currentWallet: devnetWallet } = useDevnetWallet();
  const currentWalletAddress = isDevnetEnvironment()
    ? devnetWallet?.stxAddress
    : isTestnetEnvironment()
    ? testnetAddress
    : mainnetAddress;

  const [isInitializingCampaign, setIsInitializingCampaign] = useState(false);
  const [isCancelConfirmationModalOpen, setIsCancelConfirmationModalOpen] =
    useState(false);

  const executeTx = useTransactionExecuter();
  const [goal, setGoal] = useState("");
  const handleGoalChange = (value: string) => {
    setGoal(value);
  };

  const handleInitializeCampaign = async () => {
    const txOptions = getInitializeTx(
      getStacksNetworkString(),
      currentWalletAddress || "",
      Number(goal)
    );
    await executeTx(
      txOptions,
      devnetWallet,
      "Campaign was initialized",
      "Campaign was not initialized"
    );
    setGoal("");
    setIsInitializingCampaign(true);
  };

  const handleCancel = async () => {
    setIsCancelConfirmationModalOpen(false);
    const txOptions = getCancelTx(
      getStacksNetworkString(),
      currentWalletAddress || ""
    );
    await executeTx(
      txOptions,
      devnetWallet,
      "Campaign cancellation was requested",
      "Campaign was not cancelled"
    );
  };

  const handleWithdraw = async () => {
    const txOptions = getWithdrawTx(
      getStacksNetworkString(),
      currentWalletAddress || ""
    );
    await executeTx(
      txOptions,
      devnetWallet,
      "Withdraw requested",
      "Withdraw not requested"
    );
  };

  return (
    <>
      <Alert mb="4" colorScheme="gray">
        <Box>
          <AlertTitle mb="2">This is your campaign.</AlertTitle>
          <AlertDescription>
            <Flex direction="column" gap="2">
              {campaignIsUninitialized ? (
                isInitializingCampaign ? (
                  <Box>
                    Initializing campaign, please wait for it to be confirmed
                    on-chain...
                  </Box>
                ) : (
                  <>
                    <Box mb="1">
                      Do you want to start it now? It will be open for
                      contributions and will run for 4,320 BTC blocks, or about
                      30 days.
                    </Box>
                    <NumberInput
                      bg="white"
                      min={1}
                      value={goal}
                      onChange={handleGoalChange}
                    >
                      <NumberInputField
                        placeholder="Enter goal (USD)"
                        textAlign="center"
                        fontSize="lg"
                      />
                    </NumberInput>
                    <Button
                      colorScheme="green"
                      onClick={handleInitializeCampaign}
                      isDisabled={!goal}
                    >
                      Start campaign for ${Number(goal).toLocaleString()}
                    </Button>
                  </>
                )
              ) : (
                <Flex direction="column">
                  {/* Cancelled campaign - cannot withdraw or cancel */}
                  {campaignIsCancelled ? (
                    <Box>
                      You have cancelled this campaign. Contributions are
                      eligible for a refund.
                    </Box>
                  ) : (
                    // Uncancelled campaign - controls to withdraw or cancel
                    <Flex direction="column" gap="2">
                      {campaignIsExpired ? ( // Withdrawal controls are only displayed for expired campaigns
                        <>
                          {campaignIsWithdrawn ? (
                            <Box>
                              You have already withdrawn the funds. Good luck!
                            </Box>
                          ) : (
                            <Button
                              colorScheme="green"
                              onClick={handleWithdraw}
                            >
                              Withdraw funds
                            </Button>
                          )}
                        </>
                      ) : null}
                      <Tooltip label="If you cancel the campaign, all contributions will be refunded to the donors, and this campaign will no longer accept new donations.">
                        <Button
                          colorScheme="yellow"
                          onClick={() => {
                            setIsCancelConfirmationModalOpen(true);
                          }}
                        >
                          Cancel campaign
                        </Button>
                      </Tooltip>
                    </Flex>
                  )}
                </Flex>
              )}
            </Flex>
          </AlertDescription>
        </Box>
      </Alert>
      <Modal
        isOpen={isCancelConfirmationModalOpen}
        onClose={() => {
          setIsCancelConfirmationModalOpen(false);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Campaign?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            This campaign will be cancelled. All contributors will be eligible
            for a refund, and you will not be able to collect the funds. This
            campaign will not accept new donations.
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                setIsCancelConfirmationModalOpen(false);
              }}
              mr="3"
            >
              Nevermind
            </Button>
            <Button colorScheme="blue" onClick={handleCancel}>
              Yes, End Campaign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
