import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { generatePath } from "react-router";

import { LedgerConnectionStep } from "./LedgerConnectionStep";
import { LedgerImportStep } from "./LedgerImportStep";
import { LedgerScanStep } from "./LedgerScanStep";
import { LedgerTabsProperties, LedgerTabStep } from "./LedgerTabs.contracts";
import { ListenLedger } from "@/domains/transaction/components/AuthenticationStep/Ledger/ListenLedger";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { LedgerData, useLedgerContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { assertString } from "@/utils/assertions";
import { ProfilePaths } from "@/router/paths";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { ImportActionToolbar } from "@/domains/portfolio/components/ImportWallet/ImportAddressSidePanel.blocks";
import { OptionsValue, useWalletImport } from "@/domains/wallet/hooks";
import { Button } from "@/app/components/Button";


export const LedgerTabs = ({
  activeIndex = LedgerTabStep.ListenLedgerStep,
  onClickEditWalletName,
  onStepChange,
  onCancel,
  onSubmit,
  onBack,
}: LedgerTabsProperties) => {
  const activeProfile = useActiveProfile();
  const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
  const { importWallet } = useWalletImport({ profile: activeProfile });

  const navigate = useNavigate();
  const { isBusy, disconnect, isAwaitingConnection, isAwaitingDeviceConfirmation, isConnected, listenDevice } =
    useLedgerContext();

  const { formState, handleSubmit } = useFormContext();
  const { isValid, isSubmitting } = formState;

  const [importedWallets, setImportedWallets] = useState<LedgerData[]>([]);
  const [activeTab, setActiveTab] = useState<number>(activeIndex);

  const [showRetry, setShowRetry] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const retryFunctionReference = useRef<(() => void) | undefined>(undefined);

  const importWallets = useCallback(
    async ({ wallets }: { wallets: LedgerData[] }) => {
      const device = await listenDevice();
      const deviceId = device?.id;
      assertString(deviceId);

      setImportedWallets(wallets);

      for (const network of activeProfile.availableNetworks()) {
        await Promise.all(
          wallets.map(({ path, address }) =>
            importWallet({
							ledgerOptions: {
								deviceId,
								path,
							},
              network,
              type: OptionsValue.LEDGER,
              value: address,
            }),
          ),
        );
      }
    },
    [activeProfile, listenDevice, importWallet],
  );

  const isNextDisabled = useMemo(() => isBusy || !isValid, [isBusy, isValid]);

  useKeydown("Enter", (event: KeyboardEvent) => {
    const target = event.target as Element;
    const isComponentChild = target.closest("#ledgerTabs") !== null || target.tagName === "BODY";

    if (isComponentChild && !isNextDisabled && !isSubmitting) {
      if (activeTab < LedgerTabStep.LedgerImportStep) {
        handleNext();
      } else {
        handleFinish();
      }
    }
  });

  const handleNext = useCallback(async () => {
    if (showRetry) {setShowRetry(false);}

    if (activeTab === LedgerTabStep.LedgerScanStep) {
      await handleSubmit((data: any) => importWallets(data))();
    }

    const next = activeTab + 1;
    setActiveTab(next);
    onStepChange?.(next);
  }, [activeTab, handleSubmit, importWallets, onStepChange, showRetry]);

  useEffect(() => {
    const cancel = async () => {
      await disconnect();
    };

    if (cancelling && !isBusy) {
      setCancelling(false);
      cancel();
    }
  }, [cancelling, isBusy, disconnect, isAwaitingConnection, isAwaitingDeviceConfirmation, isConnected]);

  const registerRetry = useCallback((callback?: () => void) => {
    retryFunctionReference.current = callback;
    setShowRetry(!!callback);
  }, []);

  const handleRetry = useCallback(() => {
		const callback = retryFunctionReference.current;
		if (callback) {
			callback();
		}
  }, []);

  const handleFinish = useCallback(() => {
    navigate(`/profiles/${activeProfile.id()}/dashboard`);
  }, [activeProfile, navigate]);

  const handleDeviceNotAvailable = useCallback(() => {
    navigate(generatePath(ProfilePaths.Dashboard, { profileId: activeProfile.id() }));
  }, [navigate, activeProfile]);

  const handleBack = useCallback(() => {
    setShowRetry(false);

    switch (activeTab) {
      case LedgerTabStep.LedgerImportStep: {
        const prev = LedgerTabStep.LedgerScanStep;
        setActiveTab(prev);
        onStepChange?.(prev);
        return;
      }
      case LedgerTabStep.LedgerScanStep: {
        const prev = LedgerTabStep.LedgerConnectionStep;
        setActiveTab(prev);
        onStepChange?.(prev);
        return;
      }
      case LedgerTabStep.LedgerConnectionStep:
      case LedgerTabStep.ListenLedgerStep:
      default: {
        if (onBack) {return onBack();}
        return onCancel?.();
      }
    }
  }, [activeTab, onBack, onCancel, onStepChange]);

  const showFooter = showRetry || [LedgerTabStep.LedgerScanStep, LedgerTabStep.LedgerImportStep].includes(activeTab);

  return (
    <>
      <div className={showFooter ? "pb-20 h-full" : "h-full"}>
        <Tabs id="ledgerTabs" activeId={activeTab}>
          <div data-testid="LedgerTabs" className="h-full">
            <div className="overflow-y-auto h-full">
              <TabPanel tabId={LedgerTabStep.ListenLedgerStep}>
                <ListenLedger
                  noHeading
                  onDeviceAvailable={() => {
                    setShowRetry(false);
                    setActiveTab(LedgerTabStep.LedgerConnectionStep);
                    onStepChange?.(LedgerTabStep.LedgerConnectionStep);
                  }}
                  onDeviceNotAvailable={handleDeviceNotAvailable}
                />
              </TabPanel>

              <TabPanel tabId={LedgerTabStep.LedgerConnectionStep}>
                <LedgerConnectionStep
                  cancelling={cancelling}
                  onConnect={() => {
                    setShowRetry(false);
                    setActiveTab(LedgerTabStep.LedgerScanStep);
                    onStepChange?.(LedgerTabStep.LedgerScanStep);
                  }}
                  onFailed={() => {
                    registerRetry(() => {
                      setShowRetry(false);
                      setActiveTab(LedgerTabStep.LedgerConnectionStep);
                      onStepChange?.(LedgerTabStep.LedgerConnectionStep);
                    });
                  }}
                  network={activeNetwork}
                />
              </TabPanel>

              <TabPanel tabId={LedgerTabStep.LedgerScanStep}>
                <LedgerScanStep
                  cancelling={cancelling}
                  profile={activeProfile}
                  setRetryFn={registerRetry}
                  network={activeNetwork}
                />
              </TabPanel>

              <TabPanel tabId={LedgerTabStep.LedgerImportStep}>
                <LedgerImportStep
                  network={activeNetwork}
                  wallets={importedWallets}
                  profile={activeProfile}
                  onClickEditWalletName={onClickEditWalletName}
                />
              </TabPanel>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Normal toolbar footer (no error) */}
      {showFooter && !showRetry && (
        <div className="flex absolute right-0 bottom-0 left-0 flex-col px-6 py-4 w-full border-t bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700">
          <ImportActionToolbar
            showButtons={activeTab !== LedgerTabStep.LedgerImportStep}
            onBack={handleBack}
            isContinueDisabled={isNextDisabled || isSubmitting}
            isLoading={isSubmitting}
            onContinue={handleNext}
            isSubmitDisabled={isSubmitting}
            showPortfoliobutton={activeTab === LedgerTabStep.LedgerImportStep}
            onSubmit={onSubmit}
          />
        </div>
      )}

      {/* Error-only footer (Back / Retry buttons) */}
      {showFooter && showRetry && (
        <div className="flex absolute right-0 bottom-0 left-0 flex-col px-6 py-4 w-full border-t bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700">
          <div className="flex gap-3 justify-end items-center w-full">
            <Button
              type="button"
              onClick={handleBack}
              variant="secondary"
              data-testid="LedgerFooter__backToSelection"
            >
              Back
            </Button>

            <Button
              type="button"
              onClick={handleRetry}
              variant="primary"
              data-testid="LedgerFooter__retry"
              disabled={isBusy || isSubmitting}
            >
              Retry
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
