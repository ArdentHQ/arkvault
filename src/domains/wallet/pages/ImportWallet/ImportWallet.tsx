import { uniq } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { LedgerTabs } from "./Ledger/LedgerTabs";
import { MethodStep } from "./MethodStep";
import { SuccessStep } from "./SuccessStep";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { SyncErrorMessage } from "@/app/components/ProfileSyncStatusMessage";
import { StepIndicator } from "@/app/components/StepIndicator";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks/env";
import { useKeydown } from "@/app/hooks/use-keydown";
import { toasts } from "@/app/services";
import { useWalletConfig } from "@/domains/wallet/hooks";
import { EncryptPasswordStep } from "@/domains/wallet/components/EncryptPasswordStep";
import { NetworkStep } from "@/domains/wallet/components/NetworkStep";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { useWalletImport, WalletGenerationInput } from "@/domains/wallet/hooks/use-wallet-import";
import { useWalletSync } from "@/domains/wallet/hooks/use-wallet-sync";
import { getDefaultAlias } from "@/domains/wallet/utils/get-default-alias";
import { assertString, assertWallet } from "@/utils/assertions";
import {
	enabledNetworksCount,
	networkDisplayName,
	profileAllEnabledNetworkIds,
	profileAllEnabledNetworks,
} from "@/utils/network-utils";

enum Step {
	NetworkStep = 1,
	MethodStep,
	EncryptPasswordStep,
	SummaryStep,
}

export const ImportWallet = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const isLedgerImport = location.pathname.includes("/import/ledger");

	const activeProfile = useActiveProfile();
	const { env, persist } = useEnvironmentContext();
	const onlyHasOneNetwork = enabledNetworksCount(activeProfile) === 1;
	const [activeTab, setActiveTab] = useState<Step>(Step.NetworkStep);
	const [importedWallet, setImportedWallet] = useState<Contracts.IReadWriteWallet | undefined>(undefined);
	const [walletGenerationInput, setWalletGenerationInput] = useState<WalletGenerationInput>();

	const [isImporting, setIsImporting] = useState(false);
	const [isEncrypting, setIsEncrypting] = useState(false);
	const [isSyncingCoin, setIsSyncingCoin] = useState(false);
	const [isEditAliasModalOpen, setIsEditAliasModalOpen] = useState(false);

	const { selectedNetworkIds, setValue } = useWalletConfig({ profile: activeProfile });

	const { t } = useTranslation();
	const { importWalletByType } = useWalletImport({ profile: activeProfile });
	const { syncAll } = useWalletSync({ env, profile: activeProfile });

	const form = useForm<any>({
		defaultValues: {
			network: onlyHasOneNetwork ? profileAllEnabledNetworks(activeProfile)[0] : undefined,
		},
		mode: "onChange",
	});

	const { getValues, formState, register, watch } = form;
	const { isDirty, isSubmitting, isValid } = formState;
	const { value, importOption, encryptionPassword, confirmEncryptionPassword, secondInput, useEncryption } = watch();

	useEffect(() => {
		register("network", { required: true });
		register({ name: "importOption", type: "custom" });
		register("useEncryption");
	}, [register]);

	useEffect(() => {
		if (value !== undefined) {
			setWalletGenerationInput(value);
		}
	}, [value, setWalletGenerationInput]);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (!isLedgerImport && !isButton && !isNextDisabled && activeTab <= Step.EncryptPasswordStep) {
			handleNext();
		}
	});

	useEffect(() => {
		if (onlyHasOneNetwork) {
			handleNext();
		}
	}, []);

	const handleNext = () =>
		({
			[Step.MethodStep]: async () => {
				setIsImporting(true);

				try {
					await importWallet();

					if (useEncryption && importOption.canBeEncrypted) {
						setActiveTab(Step.EncryptPasswordStep);
					} else {
						setActiveTab(Step.SummaryStep);
					}
				} catch (error) {
					/* istanbul ignore next -- @preserve */
					toasts.error(error.message);
				} finally {
					setIsImporting(false);
				}
			},
			[Step.EncryptPasswordStep]: async () => {
				setIsEncrypting(true);

				await encryptInputs();
				setActiveTab(Step.SummaryStep);

				setIsEncrypting(false);
			},
			[Step.NetworkStep]: async () => {
				// Construct coin before moving to MethodStep.
				// Will be used in import input validations
				const network = getValues("network");

				const coin = activeProfile.coins().set(network.coin(), network.id(), {
					networks: {
						[network.id()]: network.toObject(),
					},
				});

				setIsSyncingCoin(true);

				try {
					toasts.dismiss();
					await coin.__construct();
					setIsSyncingCoin(false);
				} catch {
					setIsSyncingCoin(false);

					return toasts.warning(
						<SyncErrorMessage
							failedNetworkNames={[networkDisplayName(network)]}
							onRetry={async () => {
								setIsSyncingCoin(true);
								await toasts.dismiss();
								handleNext();
							}}
						/>,
					);
				}

				setActiveTab(activeTab + 1);
			},
		})[activeTab as Exclude<Step, Step.SummaryStep>]();

	const handleBack = () => {
		if (activeTab === Step.NetworkStep || (activeTab === Step.MethodStep && onlyHasOneNetwork)) {
			return navigate(`/profiles/${activeProfile.id()}/dashboard`);
		}

		if (activeTab === Step.EncryptPasswordStep) {
			assertWallet(importedWallet);
			activeProfile.wallets().forget(importedWallet.id());
		}

		setActiveTab(activeTab - 1);
	};

	const importWallet = async (): Promise<void> => {
		const { network, importOption, encryptedWif, value: walletInput } = getValues();

		const wallet = await importWalletByType({
			encryptedWif,
			network,
			type: importOption.value,
			value: walletInput,
		});

		assertWallet(wallet);

		setValue("selectedNetworkIds", uniq([...selectedNetworkIds, wallet.network().id()]));

		await syncAll(wallet);

		wallet.mutator().alias(
			getDefaultAlias({
				network: wallet.network(),
				profile: activeProfile,
			}),
		);

		await persist();

		setImportedWallet(wallet);
	};

	const encryptInputs = async () => {
		assertWallet(importedWallet);
		assertString(walletGenerationInput);

		importedWallet.signingKey().set(walletGenerationInput, encryptionPassword);

		if (secondInput) {
			importedWallet.confirmKey().set(secondInput, encryptionPassword);
		}

		if (importedWallet.actsWithMnemonic()) {
			importedWallet
				.data()
				.set(Contracts.WalletData.ImportMethod, Contracts.WalletImportMethod.BIP39.MNEMONIC_WITH_ENCRYPTION);
		}

		if (importedWallet.actsWithSecret()) {
			importedWallet
				.data()
				.set(Contracts.WalletData.ImportMethod, Contracts.WalletImportMethod.SECRET_WITH_ENCRYPTION);
		}

		await persist();
	};

	/* istanbul ignore next -- @preserve */
	const handleEditLedgerAlias = (wallet: Contracts.IReadWriteWallet) => {
		setImportedWallet(wallet);
		setIsEditAliasModalOpen(true);
	};

	const handleFinish = () => {
		assertWallet(importedWallet);

		navigate(`/profiles/${activeProfile.id()}/wallets/${importedWallet.id()}`);
	};

	const isNextDisabled = useMemo(() => {
		if (activeTab < Step.EncryptPasswordStep) {
			return isDirty ? !isValid || isImporting : true;
		}

		if (activeTab === Step.EncryptPasswordStep) {
			return isEncrypting || !isValid || !encryptionPassword || !confirmEncryptionPassword;
		}
	}, [activeTab, confirmEncryptionPassword, encryptionPassword, isDirty, isEncrypting, isImporting, isValid]);

	const allSteps = useMemo(() => {
		const steps: string[] = [];

		if (!onlyHasOneNetwork) {
			steps.push(t("WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.TITLE"));
		}

		steps.push(t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.TITLE"));

		if (useEncryption) {
			steps.push(t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE"));
		}

		steps.push(t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.TITLE"));

		return steps;
	}, [useEncryption, activeTab]);

	const activeTabIndex = useMemo(() => {
		// Since it removes the select network step
		if (onlyHasOneNetwork) {
			return activeTab - 1;
		}

		return activeTab;
	}, [onlyHasOneNetwork, activeTab]);

	return (
		<Page pageTitle={t("WALLETS.PAGE_IMPORT_WALLET.TITLE")}>
			<Section className="flex-1">
				<Form
					className="mx-auto max-w-xl"
					context={form}
					onSubmit={handleFinish}
					data-testid="ImportWallet__form"
				>
					{isLedgerImport ? (
						<LedgerTabs onClickEditWalletName={handleEditLedgerAlias} />
					) : (
						<Tabs activeId={activeTab}>
							<StepIndicator steps={allSteps} activeIndex={activeTabIndex} />

							<div className="mt-8">
								<TabPanel tabId={Step.NetworkStep}>
									<NetworkStep
										filter={(network) =>
											profileAllEnabledNetworkIds(activeProfile).includes(network.id())
										}
										profile={activeProfile}
										title={t("WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.TITLE")}
										subtitle={t("WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.SUBTITLE")}
									/>
								</TabPanel>

								<TabPanel tabId={Step.MethodStep}>
									<MethodStep profile={activeProfile} />
								</TabPanel>

								<TabPanel tabId={Step.EncryptPasswordStep}>
									<EncryptPasswordStep importedWallet={importedWallet} />
								</TabPanel>

								<TabPanel tabId={Step.SummaryStep}>
									<SuccessStep
										importedWallet={importedWallet}
										onClickEditAlias={() => setIsEditAliasModalOpen(true)}
									/>
								</TabPanel>

								{activeTab <= Step.EncryptPasswordStep && (
									<FormButtons>
										<Button
											disabled={isImporting}
											variant="secondary"
											onClick={handleBack}
											data-testid="ImportWallet__back-button"
										>
											{t("COMMON.BACK")}
										</Button>

										<Button
											disabled={isNextDisabled || isSyncingCoin}
											isLoading={isEncrypting || isImporting || isSyncingCoin}
											onClick={handleNext}
											data-testid="ImportWallet__continue-button"
										>
											{t("COMMON.CONTINUE")}
										</Button>
									</FormButtons>
								)}

								{activeTab === Step.SummaryStep && (
									<FormButtons>
										<Button
											disabled={isSubmitting}
											type="submit"
											data-testid="ImportWallet__finish-button"
										>
											{t("COMMON.GO_TO_WALLET")}
										</Button>
									</FormButtons>
								)}
							</div>
						</Tabs>
					)}
				</Form>

				{!!importedWallet && isEditAliasModalOpen && (
					<UpdateWalletName
						wallet={importedWallet}
						profile={activeProfile}
						onCancel={() => setIsEditAliasModalOpen(false)}
						onAfterSave={() => setIsEditAliasModalOpen(false)}
					/>
				)}
			</Section>
		</Page>
	);
};
