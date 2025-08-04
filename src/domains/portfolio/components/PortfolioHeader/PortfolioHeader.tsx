import React, { useEffect, useState } from "react";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { useWalletActions } from "@/domains/wallet/hooks";
import { Contracts } from "@/app/lib/profiles";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";
import { Dropdown } from "@/app/components/Dropdown";
import { t } from "i18next";
import { Amount } from "@/app/components/Amount";
import { WalletIcons } from "@/app/components/WalletIcons";
import { Copy } from "@/app/components/Copy";
import { WalletVote } from "@/domains/wallet/pages/WalletDetails/components/WalletVote/WalletVote";
import { WalletActions } from "@/domains/portfolio/components/WalletHeader/WalletHeader.blocks";
import { Skeleton } from "@/app/components/Skeleton";
import { ViewingAddressInfo } from "./PortfolioHeader.blocks";
import { assertWallet } from "@/utils/assertions";
import { useEnvironmentContext } from "@/app/contexts";
import { WalletActionsModals } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals";
import { AddressesSidePanel } from "@/domains/portfolio/components/AddressesSidePanel";
import { useLocalStorage } from "usehooks-ts";
import { Tooltip } from "@/app/components/Tooltip";
import cn from "classnames";
import { Trans } from "react-i18next";
import { ResetWhenUnmounted } from "@/app/components/SidePanel/ResetWhenUnmounted";
import { AddressViewType } from "@/domains/portfolio/hooks/use-address-panel";
import { ProfileSetting } from "@/app/lib/profiles/profile.enum.contract";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";

export const PortfolioHeader = ({
	profile,
	votes,
	isLoadingVotes,
	isUpdatingTransactions,
	handleVotesButtonClick,
	onUpdate,
	onCreateAddress,
	onImportAddress,
	onSignMessage,
	hasFocus,
}: {
	profile: Contracts.IProfile;
	votes: Contracts.VoteRegistryItem[];
	isLoadingVotes: boolean;
	isUpdatingTransactions: boolean;
	handleVotesButtonClick: () => void;
	onUpdate?: (status: boolean) => void;
	onCreateAddress?: (open: boolean) => void;
	onImportAddress?: (open: boolean) => void;
	onSignMessage?: (open: boolean) => void;
	hasFocus?: boolean;
}) => {
	const [showAddressesPanel, setShowAddressesPanel] = useState(false);

	const allWallets = profile.wallets().values();

	const selectedWallets = profile.wallets().selected() ?? [profile.wallets().first()];
	const wallet = selectedWallets.at(0);
	assertWallet(wallet);

	const isRestored = wallet.hasBeenFullyRestored();
	const handleSignMessage = () => {
		onSignMessage?.(true);
	};

	const { activeModal, setActiveModal, handleSelectOption, handleSend } = useWalletActions({
		handleSignMessage,
		wallets: selectedWallets,
	});

	const { primaryOptions, secondaryOptions, additionalOptions, registrationOptions } =
		useWalletOptions(selectedWallets);

	const { persist } = useEnvironmentContext();

	const [showHint, setShowHint] = useState<boolean>(false);
	const [hintHasShown, persistHintShown] = useLocalStorage<boolean | undefined>("single-address-hint", undefined);

	useEffect(() => {
		let id: NodeJS.Timeout;

		if (
			hasFocus &&
			hintHasShown === undefined &&
			allWallets.length > 1 &&
			profile.walletSelectionMode() === "single"
		) {
			id = setTimeout(() => {
				setShowHint(true);
			}, 1000);
		}

		return () => {
			clearTimeout(id);
		};
	}, [hasFocus, hintHasShown, profile.walletSelectionMode(), profile.wallets().count()]);

	const onDeleteAddress = async (address: string) => {
		for (const wallet of profile.wallets().values()) {
			if (address === wallet.address()) {
				profile.wallets().forget(wallet.id());
				profile.notifications().transactions().forgetByRecipient(wallet.address());
			}
		}

		await persist();
	};

	const handleViewAddress = () => {
		if (allWallets.length > 1) {
			setShowAddressesPanel(true);
		}
	};

	return (
		<header data-testid="WalletHeader" className="md:px-10 md:pt-8 lg:container">
			<div className="bg-theme-primary-100 dark:bg-theme-dark-950 dim:bg-theme-dim-950 flex flex-col gap-3 px-2 pt-3 pb-2 sm:gap-2 md:rounded-xl">
				<div className="z-30 flex w-full flex-row items-center justify-between px-4">
					<Tooltip
						visible={showHint}
						interactive={true}
						content={
							<div className="flex flex-col items-center px-[3px] pb-1.5 text-sm leading-5 sm:flex-row sm:space-x-4 sm:pt-px sm:pb-px">
								<div className="mb-2 block max-w-96 sm:mb-0 sm:inline">
									<Trans i18nKey="WALLETS.SINGLE_ADDRESS_HINT" />
								</div>
								<Button
									size="xs"
									variant="transparent"
									data-testid="HideManageHint"
									className="bg-theme-primary-500 dim:bg-theme-dim-navy-600 h-8 w-full px-4 py-1.5 sm:w-auto"
									onClick={(e) => {
										e.stopPropagation();
										persistHintShown(true);
										setShowHint(false);
									}}
								>
									{t("COMMON.GOT_IT")}
								</Button>
							</div>
						}
						placement="bottom-end"
					>
						<div
							className={cn("flex h-fit flex-row items-center gap-1", {
								"ring-theme-primary-400 dark:ring-theme-primary-800 dark:ring-offset-theme-dark-950 rounded ring-3 ring-offset-4 ring-offset-transparent dark:sm:ring-offset-transparent":
									showHint,
							})}
						>
							<p className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 hidden rounded-l text-base leading-5 font-semibold sm:block">
								{t("COMMON.VIEWING")}:
							</p>
							<div
								onClick={handleViewAddress}
								tabIndex={0}
								onKeyPress={handleViewAddress}
								className={cn("rounded-r", {
									"cursor-pointer": allWallets.length > 1,
								})}
								data-testid="ShowAddressesPanel"
							>
								<div className="flex items-center gap-1">
									<ViewingAddressInfo
										availableWallets={allWallets.length}
										wallets={selectedWallets}
										profile={profile}
										mode={profile.walletSelectionMode()}
									/>
									{allWallets.length > 1 && (
										<Button variant="primary-transparent" size="icon" className="h-6 w-6">
											<Icon name="DoubleChevron" width={26} height={26} />
										</Button>
									)}
								</div>
							</div>
						</div>
					</Tooltip>
					<div className="flex flex-row items-center gap-1">
						<Button
							variant="secondary"
							className="dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 flex h-6 w-6 items-center justify-center p-0 sm:h-8 sm:w-auto sm:px-2 dark:bg-transparent"
							onClick={() => onImportAddress?.(true)}
						>
							<Icon name="ArrowTurnDownBracket" size="md" />
							<p className="dim:text-theme-dim-50 hidden text-base leading-5 font-semibold sm:block">
								{t("COMMON.IMPORT")}
							</p>
						</Button>
						<Divider
							type="vertical"
							className="border-theme-primary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 h-4"
						/>
						<Button
							variant="secondary"
							className="dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 flex h-6 w-6 items-center justify-center p-0 sm:h-8 sm:w-auto sm:px-2 dark:bg-transparent"
							onClick={() => onCreateAddress?.(true)}
						>
							<Icon name="Plus" size="md" />
							<p className="dim:text-theme-dim-50 hidden text-base leading-5 font-semibold sm:block">
								{t("COMMON.CREATE")}
							</p>
						</Button>
					</div>
				</div>

				<div className="flex flex-col gap-0.5">
					<div className="dark:bg-theme-dark-900 dim:bg-theme-dim-900 flex w-full flex-col gap-3 rounded bg-white p-4 md:rounded-t-lg md:rounded-b-sm">
						<div className="flex w-full max-w-full flex-row items-center justify-between overflow-x-auto">
							{selectedWallets.length === 1 && (
								<div className="flex w-full flex-1 flex-row items-center gap-3">
									<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 hidden text-sm leading-[17px] font-semibold sm:block md:text-base md:leading-5">
										{t("COMMON.ADDRESS")}
									</p>

									<div className="flex h-[17px] items-center md:h-5">
										<span className="no-ligatures text-theme-primary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-base leading-[17px] font-semibold md:text-base md:leading-5">
											<span className="lg:hidden">
												<TruncateMiddle text={wallet.address()} maxChars={16} />
											</span>
											<span className="hidden min-w-[26.375rem] lg:block">
												<Address address={wallet.address()} />
											</span>
										</span>
									</div>

									<WalletIcons
										wallet={wallet}
										exclude={["isKnown", "isStarred", "isTestNetwork"]}
										iconColor="text-theme-secondary-300 dark:text-theme-dark-500 dim:text-theme-dim-500 hover:text-theme-secondary-900 dark:hover:text-theme-secondary-200 p-0!"
										iconSize="md"
									/>
								</div>
							)}

							{selectedWallets.length > 1 && (
								<div className="flex flex-row items-center gap-1.5">
									<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 hidden text-sm leading-[17px] font-semibold sm:block md:text-base md:leading-5">
										{wallet.currency()} {t("COMMON.BALANCE")}
									</p>
									<div>
										<Amount
											value={profile.totalBalance().toNumber()}
											ticker={wallet.currency()}
											className="text-theme-primary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold md:text-base md:leading-5"
											allowHideBalance
											profile={profile}
										/>
									</div>
								</div>
							)}

							<div className="flex flex-row items-center gap-3">
								{selectedWallets.length === 1 && (
									<>
										<div className="flex items-center gap-2">
											<Copy
												copyData={wallet.address()}
												tooltip={t("COMMON.COPY_ADDRESS")}
												icon={(isCopied) =>
													isCopied ? <Icon name="CopySuccess" /> : <Icon name="Copy" />
												}
											/>

											{!!wallet.publicKey() && (
												<Copy
													copyData={wallet.publicKey() as string}
													tooltip={t("WALLETS.PAGE_WALLET_DETAILS.COPY_PUBLIC_KEY")}
													icon={() => <Icon name="CopyKey" />}
												/>
											)}
										</div>

										<Divider
											type="vertical"
											className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 mx-0 hidden h-[17px] p-0 sm:block"
										/>
									</>
								)}

								<div className="hidden sm:flex">
									<WalletActions
										profile={profile}
										wallet={wallet}
										onUpdate={onUpdate}
										isUpdatingTransactions={isUpdatingTransactions}
									/>
								</div>
							</div>
						</div>
						<Divider
							type="horizontal"
							className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 my-0 h-px border-dashed"
						/>
						<div className="flex flex-col gap-3 sm:w-full sm:flex-row sm:items-center sm:justify-between sm:gap-0">
							<div className="flex flex-col gap-2" data-testid="WalletHeader__balance">
								<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px] font-semibold">
									{t("COMMON.TOTAL_BALANCE")}
								</p>

								<div className="text-theme-secondary-900 dim:text-theme-dim-50 flex flex-row items-center text-lg leading-[21px] font-semibold md:text-2xl md:leading-[29px]">
									{isRestored && selectedWallets.length === 1 && (
										<Amount
											value={wallet.balance()}
											ticker={wallet.currency()}
											className="dark:text-theme-dark-50 dim:text-theme-dim-50"
											allowHideBalance
											profile={profile}
										/>
									)}
									{!isRestored && (
										<Skeleton width={67} className="h-[21px] md:h-[1.813rem] md:w-[4.188rem]" />
									)}
									{selectedWallets.length === 1 && (
										<Divider
											type="vertical"
											className="border-theme-secondary-300 md-lg:block dark:border-theme-dark-700 dim:border-theme-dim-700 hidden h-6"
										/>
									)}
									{isRestored && (
										<Amount
											value={profile.totalBalanceConverted().toNumber()}
											ticker={wallet.exchangeCurrency()}
											className={cn({
												"text-theme-primary-900 dark:text-theme-dark-50 dim:text-theme-dim-50":
													selectedWallets.length !== 1,
												"text-theme-secondary-700 dark:text-theme-dark-200 md-lg:block dim:text-theme-dim-200 hidden":
													selectedWallets.length === 1,
											})}
											allowHideBalance
											profile={profile}
										/>
									)}
									{!isRestored && <Skeleton width={67} className="h-[21px] md:h-[1.813rem]" />}
								</div>
							</div>

							<div className="flex flex-row items-center gap-3">
								{selectedWallets.length === 1 && (
									<Button
										data-testid="WalletHeader__send-button"
										className="dark:bg-theme-dark-navy-500 dark:hover:bg-theme-dark-navy-700 dim:bg-theme-dim-navy-600 dim:disabled:text-theme-dim-navy-700 dim:disabled:bg-theme-dim-navy-900 dim-hover:bg-theme-dim-navy-700 dim-hover:disabled:bg-theme-dim-navy-900 dim-hover:disabled:text-theme-dim-navy-700 my-auto flex-1 px-8"
										disabled={
											wallet.balance() === 0 ||
											!wallet.hasBeenFullyRestored() ||
											!wallet.hasSyncedWithNetwork()
										}
										variant="primary"
										onClick={handleSend}
									>
										{t("COMMON.SEND")}
									</Button>
								)}

								{selectedWallets.length > 1 && (
									<Button
										data-testid="WalletHeader__send-button"
										className="dark:bg-theme-dark-navy-500 dark:hover:bg-theme-dark-navy-700 dim:bg-theme-dim-navy-600 dim-hover:bg-theme-dim-navy-700 dim:disabled:text-theme-dim-navy-700 dim:disabled:bg-theme-dim-navy-900 dim-hover:disabled:bg-theme-dim-navy-900 dim-hover:disabled:text-theme-dim-navy-700 my-auto flex-1 px-8"
										disabled={profile.totalBalance().isZero()}
										variant="primary"
										onClick={handleSend}
									>
										{t("COMMON.SEND")}
									</Button>
								)}

								<div data-testid="WalletHeaderMobile__more-button" className="my-auto">
									<Dropdown
										options={[
											primaryOptions,
											registrationOptions,
											additionalOptions,
											secondaryOptions,
										]}
										toggleContent={
											<Button
												variant="secondary"
												size="icon"
												className="text-theme-primary-600 dark:hover:bg-theme-dark-navy-700 dim:bg-theme-dim-navy-900 dim-hover:bg-theme-dim-navy-700 dim:text-theme-dim-50"
											>
												<Icon name="EllipsisVerticalFilled" size="lg" />
											</Button>
										}
										onSelect={handleSelectOption}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="dark:bg-theme-dark-900 dim:bg-theme-dim-900 hidden w-full rounded-t-sm rounded-b-lg bg-white p-4 md:block">
						<WalletVote
							wallet={wallet}
							onButtonClick={handleVotesButtonClick}
							votes={votes}
							isLoadingVotes={isLoadingVotes}
							wallets={selectedWallets}
						/>
					</div>
				</div>
			</div>

			<ResetWhenUnmounted>
				<AddressesSidePanel
					profile={profile}
					wallets={allWallets}
					defaultSelectedAddresses={profile
						.wallets()
						.selected()
						.map((wallet) => wallet.address())}
					defaultSelectedWallet={wallet}
					onClose={async (addresses, newMode: AddressViewType) => {
						for (const wallet of profile.wallets().values()) {
							if (addresses.includes(wallet.address())) {
								wallet.mutator().isSelected(true);
								continue;
							}
							wallet.mutator().isSelected(false);
						}

						profile.settings().set(ProfileSetting.WalletSelectionMode, newMode);
						await persist();
					}}
					open={showAddressesPanel}
					onOpenChange={setShowAddressesPanel}
					onDelete={(address) => {
						void onDeleteAddress(address);
					}}
				/>
			</ResetWhenUnmounted>

			<WalletActionsModals
				wallets={selectedWallets}
				activeModal={activeModal}
				setActiveModal={setActiveModal}
				onUpdateWallet={() => {
					onUpdate?.(true);
				}}
			/>
		</header>
	);
};
