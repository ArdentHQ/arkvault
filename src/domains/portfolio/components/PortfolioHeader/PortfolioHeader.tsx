import React, { useEffect, useState } from "react";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { useWalletActions } from "@/domains/wallet/hooks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";
import { Dropdown } from "@/app/components/Dropdown";
import { t } from "i18next";
import { Amount } from "@/app/components/Amount";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { WalletIcons } from "@/app/components/WalletIcons";
import { Copy } from "@/app/components/Copy";
import { WalletVote } from "@/domains/wallet/pages/WalletDetails/components/WalletVote/WalletVote";
import { WalletActions } from "@/domains/portfolio/components/WalletHeader/WalletHeader.blocks";
import { Skeleton } from "@/app/components/Skeleton";
import { ViewingAddressInfo } from "./PortfolioHeader.blocks";
import { assertWallet } from "@/utils/assertions";
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";
import { useEnvironmentContext } from "@/app/contexts";
import { WalletActionsModals } from "@/domains/wallet/components/WalletActionsModals/WalletActionsModals";
import { AddressesSidePanel } from "@/domains/portfolio/components/AddressesSidePanel";
import { useLocalStorage } from "usehooks-ts";
import { Tooltip } from "@/app/components/Tooltip";
import cn from "classnames";
import { Trans } from "react-i18next";

export const PortfolioHeader = ({
	profile,
	votes,
	isLoadingVotes,
	isUpdatingTransactions,
	handleVotesButtonClick,
	onUpdate,
	onCreateAddress,
	onImportAddress,
	hasFocus,
}: {
	profile: Contracts.IProfile;
	votes: Contracts.VoteRegistryItem[];
	isLoadingVotes: boolean;
	isUpdatingTransactions: boolean;
	handleVotesButtonClick: (address?: string) => void;
	onUpdate?: (status: boolean) => void;
	onCreateAddress?: (open: boolean) => void;
	onImportAddress?: (open: boolean) => void;
	hasFocus?: boolean;
}) => {
	const [showAddressesPanel, setShowAddressesPanel] = useState(false);

	const { balance, setSelectedAddresses, selectedAddresses, selectedWallets, allWallets, removeSelectedAddresses } =
		usePortfolio({ profile });

	const wallet = selectedWallets.at(0);
	assertWallet(wallet);

	const isRestored = wallet.hasBeenFullyRestored();
	const { convert } = useExchangeRate({ exchangeTicker: wallet.exchangeCurrency(), ticker: wallet.currency() });
	const { activeModal, setActiveModal, handleSelectOption, handleSend } = useWalletActions(...selectedWallets);
	const { primaryOptions, secondaryOptions, additionalOptions, registrationOptions } =
		useWalletOptions(selectedWallets);

	const { persist } = useEnvironmentContext();

	const [showHint, setShowHint] = useState<boolean>(false);
	const [hintHasShown, persistHintShown] = useLocalStorage("multiple-addresses-hint", undefined);

	useEffect(() => {
		let id: NodeJS.Timeout;

		if (hasFocus && hintHasShown === undefined && selectedWallets.length > 1) {
			id = setTimeout(() => {
				setShowHint(true);
			}, 1000);
		}

		return () => {
			clearTimeout(id);
		};
	}, [hasFocus, hintHasShown, selectedWallets.length]);

	const onDeleteAddress = async (address: string) => {
		for (const wallet of profile.wallets().values()) {
			if (address === wallet.address()) {
				profile.wallets().forget(wallet.id());
				await removeSelectedAddresses([wallet.address()], wallet.network());
				profile.notifications().transactions().forgetByRecipient(wallet.address());
			}
		}

		await persist();
	};

	return (
		<header data-testid="WalletHeader" className="lg:container md:px-10 md:pt-8">
			<div className="flex flex-col gap-3 bg-theme-primary-100 px-2 pb-2 pt-3 dark:bg-theme-dark-950 sm:gap-2 md:rounded-xl">
				<div className="flex w-full flex-row items-center justify-between px-4">
					<Tooltip
						visible={showHint}
						interactive={true}
						/* istanbul ignore next -- @preserve */
						// maxWidth={isXs ? 264 : "none"}
						maxWidth={"none"}
						content={
							<div className="flex items-center px-[3px] pb-1.5 text-sm leading-5 sm:space-x-4 sm:pb-px sm:pt-px">
								<div className="mb-2 block sm:mb-0 sm:inline">
									<Trans i18nKey="WALLETS.MULTIPLE_ADDRESSES_HINT" />
								</div>
								<Button
									size="xs"
									variant="transparent"
									data-testid="HideManageHint"
									className="h-8 w-full bg-theme-primary-500 px-4 py-1.5 sm:w-auto"
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
								"rounded ring ring-theme-primary-400 ring-offset-4 ring-offset-theme-secondary-100 dark:ring-theme-primary-800 dark:ring-offset-theme-dark-950 sm:ring-offset-theme-primary-100 dark:sm:ring-offset-transparent":
									showHint,
							})}
						>
							<p className="hidden rounded-l text-base font-semibold leading-5 text-theme-secondary-900 dark:text-theme-dark-50 sm:block">
								{t("COMMON.VIEWING")}:
							</p>
							<div
								onClick={() => setShowAddressesPanel(true)}
								tabIndex={0}
								onKeyPress={() => setShowAddressesPanel(true)}
								className="cursor-pointer rounded-r"
								data-testid="ShowAddressesPanel"
							>
								<div className="flex items-center gap-1">
									<ViewingAddressInfo wallets={selectedWallets} profile={profile} />
									<Icon
										name="DoubleChevron"
										width={26}
										height={26}
										className="text-theme-dark-200 text-theme-secondary-700"
									/>
								</div>
							</div>
						</div>
					</Tooltip>
					<div className="flex flex-row items-center gap-1">
						<Button
							variant="secondary"
							className="flex h-6 w-6 items-center justify-center p-0 hover:bg-theme-primary-200 hover:text-theme-primary-700 dark:bg-transparent dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 sm:h-8 sm:w-auto sm:px-2"
							onClick={() => onImportAddress?.(true)}
						>
							<Icon name="ArrowTurnDownBracket" size="md" />
							<p className="hidden text-base font-semibold leading-5 sm:block">{t("COMMON.IMPORT")}</p>
						</Button>
						<Divider type="vertical" className="h-4 border-theme-primary-300 dark:border-theme-dark-700" />
						<Button
							variant="secondary"
							className="flex h-6 w-6 items-center justify-center p-0 hover:bg-theme-primary-200 hover:text-theme-primary-700 dark:bg-transparent dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 sm:h-8 sm:w-auto sm:px-2"
							onClick={() => onCreateAddress?.(true)}
						>
							<Icon name="Plus" size="md" />
							<p className="hidden text-base font-semibold leading-5 sm:block">{t("COMMON.CREATE")}</p>
						</Button>
					</div>
				</div>

				<div className="flex flex-col gap-0.5">
					<div className="flex w-full flex-col gap-3 rounded bg-white p-4 dark:bg-theme-dark-900 md:rounded-b-sm md:rounded-t-lg">
						<div className="flex w-full flex-row items-center justify-between">
							{selectedWallets.length === 1 && (
								<div className="flex flex-row items-center gap-1.5">
									<p className="hidden text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200 sm:block md:text-base md:leading-5">
										{t("COMMON.ADDRESS")}
									</p>
									<div className="h-[17px] w-32 md:h-5 md:w-60 lg:w-125">
										<Address
											alignment="center"
											address={wallet.address()}
											truncateOnTable
											addressClass="text-theme-primary-900 text-sm font-semibold leading-[17px] md:text-base md:leading-5 dark:text-theme-dark-50"
										/>
									</div>
									<WalletIcons
										wallet={wallet}
										exclude={["isKnown", "isSecondSignature", "isStarred", "isTestNetwork"]}
										iconColor="text-theme-secondary-300 dark:text-theme-dark-700"
									/>
								</div>
							)}

							{selectedWallets.length > 1 && (
								<div className="flex flex-row items-center gap-1.5">
									<p className="hidden text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200 sm:block md:text-base md:leading-5">
										{wallet.currency()} {t("COMMON.BALANCE")}
									</p>
									<div>
										<Amount
											value={balance.total().toNumber()}
											ticker={wallet.currency()}
											className="text-sm font-semibold leading-[17px] text-theme-primary-900 dark:text-theme-dark-50 md:text-base md:leading-5"
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
												tooltip={t("COMMON.COPY_ID")}
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
											className="mx-0 hidden h-[17px] border-theme-secondary-300 p-0 dark:border-theme-dark-700 sm:block"
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
							className="my-0 h-px border-dashed border-theme-secondary-300 dark:border-theme-dark-700"
						/>
						<div className="flex flex-col gap-3 sm:w-full sm:flex-row sm:items-center sm:justify-between sm:gap-0">
							<div className="flex flex-col gap-3 sm:gap-2" data-testid="WalletHeader__balance">
								<div className="flex flex-row items-center text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:text-theme-dark-200">
									<p>{t("COMMON.TOTAL_BALANCE")}</p>
									<Divider
										type="vertical"
										className="h-3 border-theme-secondary-300 dark:border-theme-dark-700 md-lg:hidden"
									/>
									<Amount
										value={convert(wallet.balance())}
										ticker={wallet.exchangeCurrency()}
										className="md-lg:hidden"
										allowHideBalance
										profile={profile}
									/>
								</div>

								<div className="flex flex-row items-center text-lg font-semibold leading-[21px] text-theme-secondary-900 md:text-2xl md:leading-[29px]">
									{isRestored && selectedWallets.length === 1 && (
										<Amount
											value={wallet.balance()}
											ticker={wallet.currency()}
											className="dark:text-theme-dark-50"
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
											className="hidden h-6 border-theme-secondary-300 dark:border-theme-dark-700 md-lg:block"
										/>
									)}
									{isRestored && (
										<Amount
											value={balance.totalConverted().toNumber()}
											ticker={wallet.exchangeCurrency()}
											className="hidden text-theme-secondary-700 dark:text-theme-dark-200 md-lg:block"
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
										className="my-auto flex-1 px-8 dark:bg-theme-dark-navy-500 dark:hover:bg-theme-dark-navy-700"
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
										className="my-auto flex-1 px-8 dark:bg-theme-dark-navy-500 dark:hover:bg-theme-dark-navy-700"
										disabled={balance.total().isZero()}
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
												className="text-theme-primary-600 dark:hover:bg-theme-dark-navy-700"
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

					<div className="hidden w-full rounded-b-lg rounded-t-sm bg-white p-4 dark:bg-theme-dark-900 md:block">
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

			<AddressesSidePanel
				profile={profile}
				wallets={allWallets}
				defaultSelectedAddresses={selectedAddresses}
				onClose={(addresses) => {
					setSelectedAddresses(addresses);
				}}
				open={showAddressesPanel}
				onOpenChange={setShowAddressesPanel}
				onDelete={(address) => {
					void onDeleteAddress(address);
				}}
			/>

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
