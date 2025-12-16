import { Panel, usePanels } from "@/app/contexts/Panels";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Contracts } from "@/app/lib/profiles";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { Label } from "@/app/components/Label";
import { Skeleton } from "@/app/components/Skeleton";
import { Tooltip } from "@/app/components/Tooltip";
import { ViewingAddressInfo } from "./TokenHeader.blocks";
import { assertWallet } from "@/utils/assertions";
import cn from "classnames";
import { t } from "i18next";
import { useWalletActions } from "@/domains/wallet/hooks";

export const TokenHeader = ({ profile }: { profile: Contracts.IProfile; }) => {
	const { openPanel } = usePanels();

	const allWallets = profile.wallets().values();

	const selectedWallets = profile.wallets().selected();
	const wallet = selectedWallets.at(0);
	assertWallet(wallet);

	const isRestored = wallet.hasBeenFullyRestored();

	const { handleSend } = useWalletActions({ wallets: selectedWallets });

	const handleViewAddress = () => {
		if (allWallets.length > 1) {
			openPanel(Panel.Addresses);
		}
	};

	const hasTokens = selectedWallets.length === 1 && wallet.tokenCount() > 0;

	return (
		<header data-testid="WalletHeader" className="md:px-10 lg:container">
			<div className="bg-theme-primary-100 dark:bg-theme-dark-950 dim:bg-theme-dim-950 flex flex-col gap-3 px-2 pt-3 pb-2 sm:gap-2 md:rounded-xl">
				<div className="z-30 flex w-full flex-row items-center justify-between px-4">
					<div className="flex h-fit flex-row items-center gap-1" >
						<p className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 hidden rounded-l text-base leading-5 font-semibold sm:block">
							{t("COMMON.VIEWING")}:
						</p>
						<div
							onClick={handleViewAddress}
							tabIndex={0}
							onKeyPress={handleViewAddress}
							className={cn("max-w-full rounded-r", {
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

								{wallet.isHDWallet() && selectedWallets.length === 1 && (
									<Label
										color="primary"
										size="xs"
										variant="outline"
										className="truncate border py-0.5 uppercase"
									>
										{wallet.accountName()}
									</Label>
								)}

								{allWallets.length > 1 && (
									<Button variant="primary-transparent" size="icon" className="h-6 w-6">
										<Icon name="DoubleChevron" width={26} height={26} />
									</Button>
								)}
							</div>
						</div>
					</div>

					<div className="flex flex-row items-center gap-1">
						<Button
							variant="secondary"
							className="dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 flex h-6 w-6 items-center justify-center p-0 sm:h-8 sm:w-auto sm:px-2 dark:bg-transparent"
							onClick={() => openPanel(Panel.ImportAddress)}
						>
							<Icon
								name="Plus"
								size="md"
								className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50"
							/>
							<p className="dim:text-theme-dim-50 hidden text-base leading-5 font-semibold sm:block">
								{t("COMMON.ADD_TOKEN")}
							</p>
						</Button>
						<Divider
							type="vertical"
							className="border-theme-primary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 h-4"
						/>
						<Button
							variant="secondary"
							className="dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 flex h-6 w-6 items-center justify-center p-0 sm:h-8 sm:w-auto sm:px-2 dark:bg-transparent"
							onClick={() => console.log("TODO: Refresh tokens")}
						>

							<Icon
								name="ArrowRotateLeft"
								style={{ animationDirection: "reverse" }}
								className="text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50"
							/>
						</Button>
					</div>
				</div>

				<div className="flex flex-col gap-0.5">
					<div className="dark:bg-theme-dark-900 dim:bg-theme-dim-900 rounded bg-white md:rounded-t-lg md:rounded-b-sm">
						<div className="flex w-full flex-col gap-3 p-4">
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
									<Tooltip
										content={t("COMMON.DISABLED_DUE_INSUFFICIENT_BALANCE")}
										disabled={!profile.totalBalance().isZero()}
									>
										<div className="my-auto flex flex-1">
											<Button
												data-testid="WalletHeader__send-button"
												className="dark:bg-theme-dark-navy-500 dark:hover:bg-theme-dark-navy-700 dim:bg-theme-dim-navy-600 dim-hover:bg-theme-dim-navy-700 dim:disabled:text-theme-dim-navy-700 dim:disabled:bg-theme-dim-navy-900 dim-hover:disabled:bg-theme-dim-navy-900 dim-hover:disabled:text-theme-dim-navy-700 my-auto flex-1 px-8"
												disabled={profile.totalBalance().isZero()}
												variant="primary"
												onClick={handleSend}
											>
												{t("COMMON.SEND")}
											</Button>
										</div>
									</Tooltip>

									<Button
										variant="secondary"
										size="icon"
										className="text-theme-primary-600 dark:hover:bg-theme-dark-navy-700 dim:bg-theme-dim-navy-900 dim-hover:bg-theme-dim-navy-700 dim:text-theme-dim-50"
									>
										<Icon name="Received" size="lg" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};
