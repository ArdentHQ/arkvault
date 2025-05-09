import { DefaultTReturn, TOptions } from "i18next";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { WalletOverviewStep } from "@/domains/portfolio/components/CreateWallet/WalletOverviewStep";
import { ConfirmPassphraseStep } from "@/domains/portfolio/components/CreateWallet/ConfirmPassphraseStep";
import { EncryptPasswordStep } from "@/domains/wallet/components/EncryptPasswordStep";
import { SuccessStep } from "@/domains/portfolio/components/CreateWallet/SuccessStep";
import { Button } from "@/app/components/Button";
import { useEnvironmentContext } from "@/app/contexts";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useActiveProfile } from "@/app/hooks";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useWalletImport } from "@/domains/wallet/hooks";
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";
import { useForm } from "react-hook-form";
import { assertNetwork, assertString, assertWallet } from "@/utils/assertions";
import { getDefaultAlias } from "@/domains/wallet/utils/get-default-alias";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { Contracts } from "@/app/lib/profiles";
import { Header } from "@/app/components/Header";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { StepIndicator } from "@/app/components/StepIndicator";
import classNames from "classnames";

enum Step {
	WalletOverviewStep = 1,
	ConfirmPassphraseStep = 2,
	EncryptPasswordStep = 3,
	SuccessStep = 4,
}

export const CreateAddressesSidePanel = ({
	open,
	onOpenChange,
	onMountChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onMountChange?: (mounted: boolean) => void;
}): JSX.Element => {
	const { persist } = useEnvironmentContext();
	const history = useHistory();
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const [activeTab, setActiveTab] = useState<Step>(Step.WalletOverviewStep);
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	const { importWallets } = useWalletImport({ profile: activeProfile });

	const { setSelectedAddresses, selectedAddresses } = usePortfolio({ profile: activeProfile });

	const form = useForm<any>({
		defaultValues: {
			network: activeNetwork,
			passphraseDisclaimer: false,
		},
		mode: "onChange",
	});

	const { getValues, formState, register, setValue, watch } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const { useEncryption, encryptionPassword, confirmEncryptionPassword, wallet, mnemonic, acceptResponsibility } =
		watch();

	const [isGeneratingWallet, setIsGeneratingWallet] = useState(true);
	const [_, setGenerationError] = useState<string | DefaultTReturn<TOptions>>("");
	const [isEditAliasModalOpen, setIsEditAliasModalOpen] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const [isScrollable, setIsScrollable] = useState(false);

	useEffect(() => {
		if (!open) {
			return;
		}

		const checkScrollable = () => {
			const el = scrollContainerRef.current;
			if (el) {
				setIsScrollable(el.scrollHeight > el.clientHeight);
			}
		};

		checkScrollable();

		const resizeObserver = new ResizeObserver(() => checkScrollable());
		if (scrollContainerRef.current) {
			resizeObserver.observe(scrollContainerRef.current);
		}

		return () => resizeObserver.disconnect();
	}, [open]);

	useEffect(() => {
		register("network", { required: true });
		register({ name: "useEncryption", type: "boolean", value: false });
		register({ name: "acceptResponsibility", type: "boolean", value: false });
		register("wallet");
		register("mnemonic");
		register("passphraseDisclaimer");
	}, [register, open]);

	useEffect(() => {
		if (open) {
			void handleGenerateWallet();
		}
	}, [open]);

	useEffect(() => {
		if (wallet && mnemonic) {
			setIsGeneratingWallet(false);
		}
	}, [wallet, mnemonic]);

	const handleFinish = () => {
		onOpenChange(false);
	};

	const generateWallet = () => {
		const network = getValues("network");

		assertNetwork(network);

		const locale = activeProfile.settings().get<string>(Contracts.ProfileSetting.Bip39Locale, "english");

		return activeProfile.walletFactory().generate({
			locale,
			wordCount: network.wordCount(),
		});
	};

	const handleGenerateWallet = async () => {
		setGenerationError("");
		setIsGeneratingWallet(true);

		try {
			const { mnemonic, wallet } = await generateWallet();
			setSelectedAddresses([...selectedAddresses, wallet.address()]);
			setValue("wallet", wallet, { shouldDirty: true, shouldValidate: true });
			setValue("mnemonic", mnemonic, { shouldDirty: true, shouldValidate: true });
			setActiveTab(Step.WalletOverviewStep);
		} catch {
			setGenerationError(t("WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.GENERATION_ERROR"));
		}
	};

	const handleBack = () => {
		if (activeTab === Step.WalletOverviewStep) {
			return history.push(`/profiles/${activeProfile.id()}/dashboard`);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = async (parameters: { encryptionPassword?: string } = {}) => {
		let newIndex = activeTab + 1;

		if (newIndex === Step.EncryptPasswordStep && !useEncryption) {
			newIndex = newIndex + 1;
		}

		if (newIndex === Step.WalletOverviewStep) {
			void handleGenerateWallet();

			return;
		}

		if (newIndex === Step.SuccessStep) {
			const { mnemonic, network } = getValues(["mnemonic", "network"]);

			let wallet = getValues("wallet");

			assertNetwork(network);
			assertString(mnemonic);
			assertWallet(wallet);

			if (useEncryption && parameters.encryptionPassword) {
				setIsGeneratingWallet(true);

				try {
					wallet = await activeProfile.walletFactory().fromMnemonicWithBIP39({
						mnemonic,
						password: parameters.encryptionPassword,
					});
				} catch {
					setIsGeneratingWallet(false);
					setGenerationError(t("WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.GENERATION_ERROR"));
					return;
				}
			}

			setIsGeneratingWallet(false);

			assertWallet(wallet);
			wallet.mutator().alias(getDefaultAlias({ profile: activeProfile }));

			await importWallets({
				encryptedWif: parameters.encryptionPassword,
				type: "bip39",
				value: mnemonic,
			});

			setValue("wallet", wallet);

			await persist();
		}

		setActiveTab(newIndex);
	};

	const handlePasswordSubmit = () => {
		assertString(encryptionPassword);

		void handleNext({ encryptionPassword });
	};

	const renderUpdateWalletNameModal = () => {
		if (!isEditAliasModalOpen) {
			return;
		}

		const wallet = getValues("wallet");

		assertWallet(wallet);

		return (
			<UpdateWalletName
				wallet={wallet}
				profile={activeProfile}
				onCancel={() => setIsEditAliasModalOpen(false)}
				onAfterSave={() => setIsEditAliasModalOpen(false)}
			/>
		);
	};

	const allSteps = useMemo(() => {
		const steps: string[] = [];

		steps.push(
			t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.TITLE"),
			t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.TITLE"),
		);

		if (useEncryption) {
			steps.push(t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE"));
		}

		steps.push(t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.TITLE"));

		return steps;
	}, [useEncryption, t]);

	const isNextDisabled = useMemo(() => {
		if (activeTab === Step.ConfirmPassphraseStep) {
			return useEncryption && !acceptResponsibility;
		}
	}, [activeTab, acceptResponsibility, useEncryption]);

	return (
		<SidePanel
			header={<StepHeader step={activeTab} />}
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="CreateAddressSidePanel"
			scrollRef={scrollContainerRef}
			onMountChange={onMountChange}
		>
			<Form context={form} onSubmit={handleFinish} className="space-y-0">
				<Tabs activeId={activeTab} className="pb-20">
					<div className="mb-4 sm:hidden">
						<StepIndicator steps={allSteps} activeIndex={activeTab} showTitle={false} />
					</div>

					<div>
						<TabPanel tabId={Step.WalletOverviewStep}>
							<WalletOverviewStep isGeneratingWallet={isGeneratingWallet} />
						</TabPanel>

						<TabPanel tabId={Step.ConfirmPassphraseStep}>
							<ConfirmPassphraseStep />
						</TabPanel>

						<TabPanel tabId={Step.EncryptPasswordStep}>
							<EncryptPasswordStep />
						</TabPanel>

						<TabPanel tabId={Step.SuccessStep}>
							<SuccessStep onClickEditAlias={() => setIsEditAliasModalOpen(true)} />
						</TabPanel>
					</div>
				</Tabs>

				<div
					data-testid="CreateAddressSidePanel__footer"
					className={classNames(
						"fixed inset-x-0 bottom-0 mr-[5px] flex items-center justify-end bg-theme-background p-2 px-4 sm:justify-between sm:px-6 sm:py-6 md:px-8",
						{ "shadow-footer-side-panel": isScrollable },
					)}
				>
					<div className="hidden min-w-[136px] sm:block">
						<StepIndicator steps={allSteps} activeIndex={activeTab} showTitle={false} />
					</div>

					<div className="flex w-full gap-3 sm:justify-end [&>button]:flex-1 sm:[&>button]:flex-none">
						{activeTab <= Step.EncryptPasswordStep && (
							<>
								{activeTab < Step.SuccessStep && activeTab !== Step.WalletOverviewStep && (
									<Button
										data-testid="CreateWallet__back-button"
										disabled={isGeneratingWallet}
										variant="secondary"
										onClick={handleBack}
									>
										{t("COMMON.BACK")}
									</Button>
								)}

								{activeTab < Step.EncryptPasswordStep && (
									<Button
										data-testid="CreateWallet__continue-button"
										disabled={isDirty ? !isValid || isGeneratingWallet || isNextDisabled : true}
										isLoading={isGeneratingWallet}
										onClick={() => handleNext()}
									>
										{t("COMMON.CONTINUE")}
									</Button>
								)}

								{activeTab === Step.EncryptPasswordStep && (
									<Button
										data-testid="CreateWallet__continue-encryption-button"
										disabled={
											!isValid ||
											isGeneratingWallet ||
											!encryptionPassword ||
											!confirmEncryptionPassword
										}
										isLoading={isGeneratingWallet}
										onClick={handlePasswordSubmit}
									>
										{t("COMMON.CONTINUE")}
									</Button>
								)}
							</>
						)}

						{activeTab === Step.SuccessStep && (
							<Button disabled={isSubmitting} type="submit" data-testid="CreateWallet__finish-button">
								{t("COMMON.CLOSE")}
							</Button>
						)}
					</div>
				</div>
			</Form>

			{renderUpdateWalletNameModal()}
		</SidePanel>
	);
};

const StepHeader = ({ step }: { step: Step }): JSX.Element => {
	const { t } = useTranslation();

	const headers: Record<Step, JSX.Element> = {
		[Step.WalletOverviewStep]: (
			<Header
				title={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.TITLE")}
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				titleIcon={
					<ThemeIcon darkIcon="YourPassphraseDark" lightIcon="YourPassphraseLight" dimensions={[24, 24]} />
				}
				className="mt-px"
			/>
		),
		[Step.ConfirmPassphraseStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.TITLE")}
				titleIcon={
					<Icon name="ConfirmYourPassphrase" dimensions={[24, 24]} className="text-theme-primary-600" />
				}
				subtitle={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.SUBTITLE")}
				className="mt-px"
			/>
		),
		[Step.EncryptPasswordStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE")}
				className="mt-px"
				titleIcon={
					<ThemeIcon
						lightIcon="WalletEncryptionLight"
						darkIcon="WalletEncryptionDark"
						dimensions={[24, 24]}
					/>
				}
			/>
		),
		[Step.SuccessStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.TITLE")}
				titleIcon={
					<Icon
						className="text-theme-success-100 dark:text-theme-success-900"
						dimensions={[24, 24]}
						name="Completed"
						data-testid="icon-Completed"
					/>
				}
				subtitle={t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.SUBTITLE")}
				className="mt-px"
			/>
		),
	};

	return headers[step];
};
