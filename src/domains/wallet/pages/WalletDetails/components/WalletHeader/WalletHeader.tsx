import React from "react";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { useWalletAlias } from "@/app/hooks";
import { useWalletActions } from "@/domains/wallet/hooks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";
import { Dropdown } from "@/app/components/Dropdown";
import { t } from "i18next";
import { Amount } from "@/app/components/Amount";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { WalletIcons } from "@/app/components/WalletIcons";
import { Copy } from "@/app/components/Copy";
import { Clipboard } from "@/app/components/Clipboard";
import { WalletVote } from "@/domains/wallet/pages/WalletDetails/components/WalletVote/WalletVote";
import { WalletActions } from "./WalletHeader.blocks";

export const WalletHeader = ({
	profile,
	wallet,
	votes,
	isLoadingVotes,
	isUpdatingTransactions,
	handleVotesButtonClick,
	onUpdate,
}: {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	votes: Contracts.VoteRegistryItem[];
	isLoadingVotes: boolean;
	isUpdatingTransactions: boolean;
	handleVotesButtonClick: (address?: string) => void;
	onUpdate?: (status: boolean) => void;
}) => {
	const { handleImport, handleCreate, handleSelectOption, handleSend } = useWalletActions(wallet);
	const { primaryOptions, secondaryOptions, additionalOptions, registrationOptions } = useWalletOptions(wallet);
	const { convert } = useExchangeRate({ exchangeTicker: wallet.exchangeCurrency(), ticker: wallet.currency() });

	const { getWalletAlias } = useWalletAlias();
	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile,
	});

	return (
		<header data-testid="WalletHeader" className="lg:container md:px-10 md:pt-8">
			<div className="flex flex-col gap-3 bg-theme-primary-100 px-2 py-3 dark:bg-theme-dark-950 sm:gap-2 md:rounded-xl">
				<div className="flex w-full flex-row items-center justify-between px-4">
					<div className="flex h-fit flex-row items-center gap-1">
						<p className="hidden text-base font-semibold leading-5 text-theme-secondary-900 dark:text-theme-dark-50 sm:block">
							{t("COMMON.VIEWING")}:
						</p>
						<Address
							alignment="center"
							walletName={alias}
							truncateOnTable
							maxNameChars={20}
							walletNameClass="text-theme-primary-600 text-sm leading-[17px] sm:text-base sm:leading-5 dark:textdark-theme-dark-navy-400"
						/>
					</div>
					<div className="flex flex-row items-center gap-1">
						<Button
							variant="secondary"
							className="flex h-6 w-6 items-center justify-center p-0 dark:bg-transparent dark:text-theme-dark-50 sm:h-8 sm:w-auto sm:px-2"
							onClick={handleImport}
						>
							<Icon name="ArrowTurnDownBracket" size="md" />
							<p className="hidden text-base font-semibold leading-5 sm:block">
								{t("COMMON.IMPORT")}
							</p>
						</Button>
						<Divider type="vertical" className="h-4 border-theme-primary-300 dark:border-theme-dark-700" />
						<Button
							variant="secondary"
							className="flex h-6 w-6 items-center justify-center p-0 dark:bg-transparent dark:text-theme-dark-50 sm:h-8 sm:w-auto sm:px-2"
							onClick={handleCreate}
						>
							<Icon name="Plus" size="md" />
							<p className="hidden pl-2 text-base font-semibold leading-5 sm:block">
								{t("COMMON.CREATE")}
							</p>
						</Button>
					</div>
				</div>

				<div className="flex flex-col gap-0.5">
					<div className="flex w-full flex-col gap-3 rounded bg-white p-4 dark:bg-theme-dark-900 md:rounded-b-sm md:rounded-t-lg">
						<div className="flex w-full flex-row items-center justify-between">
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
							<div className="flex flex-row items-center gap-2">
								<Copy
									address={wallet.address()}
									className="text-theme-secondary-700 dark:text-theme-dark-200"
								/>

								{!!wallet.publicKey() && (
									<Clipboard
										variant="icon"
										data={wallet.publicKey() as string}
										tooltip={t("WALLETS.PAGE_WALLET_DETAILS.COPY_PUBLIC_KEY")}
										tooltipDarkTheme
									>
										<Icon
											name="CopyKey"
											size="md"
											className="text-theme-secondary-700 hover:text-theme-secondary-500 dark:text-theme-dark-200"
										/>
									</Clipboard>
								)}

								<Divider
									type="vertical"
									className="mx-2 hidden h-[17px] border-theme-secondary-300 p-0 dark:border-theme-dark-700 sm:block"
								/>

								<div className="hidden h-4 w-4 sm:block">
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
									/>
								</div>

								<div className="flex flex-row items-center text-lg font-semibold leading-[21px] text-theme-secondary-900 md:text-2xl md:leading-[29px]">
									<Amount
										value={wallet.balance()}
										ticker={wallet.currency()}
										className="dark:text-theme-dark-50"
									/>
									<Divider
										type="vertical"
										className="hidden h-6 border-theme-secondary-300 dark:border-theme-dark-700 md-lg:block"
									/>
									<Amount
										value={convert(wallet.balance())}
										ticker={wallet.exchangeCurrency()}
										className="hidden text-theme-secondary-700 dark:text-theme-dark-200 md-lg:block"
									/>
								</div>
							</div>

							<div className="flex flex-row items-center gap-3">
								<Button
									data-testid="WalletHeader__send-button"
									className="my-auto flex-1 dark:bg-theme-dark-navy-500"
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

								<div data-testid="WalletHeaderMobile__more-button" className="my-auto">
									<Dropdown
										options={[
											primaryOptions,
											registrationOptions,
											additionalOptions,
											secondaryOptions,
										]}
										toggleContent={
											<Button variant="secondary" size="icon" className="text-theme-primary-600">
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
						/>
					</div>
				</div>
			</div>
		</header>
	);
};
