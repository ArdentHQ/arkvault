import { Button } from "@/app/components/Button";
import { Contracts } from "@/app/lib/profiles";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { Label } from "@/app/components/Label";
import { assertWallet } from "@/utils/assertions";
import cn from "classnames";
import { t } from "i18next";
import { useWalletActions } from "@/domains/wallet/hooks";
import { ViewingAddressInfo } from "@/domains/portfolio/components/PortfolioHeader/PortfolioHeader.blocks";
import { useState } from "react";
import { TokenReceiveFunds } from "@/domains/tokens/components/TokenReceiveFunds";
import { Panel, usePanels } from "@/app/contexts";

export const TokenHeader = ({
	isLoading,
	profile,
	onOpenAddressSidepanel,
	onReload,
}: {
	isLoading?: boolean;
	profile: Contracts.IProfile;
	onOpenAddressSidepanel?: () => void;
	onReload?: () => void;
}) => {
	const { openPanel } = usePanels();

	const allWallets = profile.wallets().values();

	const selectedWallets = profile.wallets().selected();
	const wallet = selectedWallets.at(0);
	assertWallet(wallet);

	const { handleTokenSend } = useWalletActions({ wallets: selectedWallets });

	const handleViewAddress = () => {
		if (allWallets.length > 1) {
			onOpenAddressSidepanel?.();
		}
	};

	const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

	const hasTokenBalance = selectedWallets.some((wallet) =>
		wallet
			.tokens()
			.values()
			.some((walletToken) => walletToken.balance().isGreaterThan(0)),
	);

	return (
		<>
			<header data-testid="TokensHeader" className="lg:container md:px-10">
				<div className="flex flex-col gap-3 bg-theme-primary-100 px-2 pb-2 pt-3 dim:bg-theme-dim-950 dark:bg-theme-dark-950 sm:gap-2 md:rounded-xl">
					<div className="z-30 flex w-full flex-row items-center justify-between px-4">
						<div className="flex h-fit flex-row items-center gap-1">
							<p className="hidden rounded-l text-base font-semibold leading-5 text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50 sm:block">
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
								data-testid="Tokens__AddToken"
								onClick={() => openPanel(Panel.AddToken)}
								variant="secondary"
								className="group flex h-6 w-6 items-center justify-center p-0 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dark:bg-transparent dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 sm:h-8 sm:w-auto sm:px-2"
							>
								<Icon
									name="Plus"
									size="md"
									className="text-theme-secondary-700 group-hover:text-theme-primary-700 dim:text-theme-dim-200 dim:group-hover:text-theme-dim-50 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50"
								/>
								<p className="hidden text-base font-semibold leading-5 dim:text-theme-dim-50 sm:block">
									{t("COMMON.ADD_TOKEN")}
								</p>
							</Button>
							<Divider
								type="vertical"
								className="h-4 border-theme-primary-300 dim:border-theme-dim-700 dark:border-theme-dark-700"
							/>
							<Button
								variant="secondary"
								className="flex h-6 w-6 items-center justify-center p-0 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dark:bg-transparent dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 sm:h-8 sm:w-auto sm:px-2"
								onClick={onReload}
							>
								<Icon
									name="ArrowRotateLeft"
									style={{ animationDirection: "reverse" }}
									className={cn(
										"text-theme-navy-600 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50 dark:text-theme-dark-200 dark:hover:text-theme-dark-50",
										{
											"animate-spin": isLoading,
										},
									)}
								/>
							</Button>
						</div>
					</div>

					<div className="flex flex-col gap-0.5">
						<div className="rounded bg-white dim:bg-theme-dim-900 dark:bg-theme-dark-900 md:rounded-b-sm md:rounded-t-lg">
							<div className="flex w-full flex-col gap-3 p-4">
								<div className="flex flex-col gap-3 sm:w-full sm:flex-row sm:items-center sm:justify-between sm:gap-0">
									<div className="flex items-center gap-3">
										<div className="flex flex-col gap-2" data-testid="TokensHeader__tokens">
											<div className="flex items-center gap-1">
												<p className="text-sm font-semibold leading-[17px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
													{t("COMMON.TOKENS")}
												</p>

												<Divider
													type="vertical"
													className="h-3 border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:hidden"
												/>

												<p className="text-sm font-semibold leading-[17px] text-theme-secondary-500 dim:text-theme-dim-500 dark:text-theme-dark-500 sm:hidden">
													{t("COMMON.NOT_AVAILABLE")}
												</p>
											</div>

											<div className="items-center text-lg font-semibold leading-[21px] text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50 md:text-2xl md:leading-[29px]">
												{profile.tokens().selectedCount()}
											</div>
										</div>

										<Divider
											type="vertical"
											className="hidden h-12 border-theme-secondary-300 dim:border-theme-dim-700 dark:border-theme-dark-700 md-lg:block"
										/>

										<div
											className="hidden flex-col gap-2 sm:flex"
											data-testid="TokensHeader__balance"
										>
											<p className="text-sm font-semibold leading-[17px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
												{t("COMMON.TOTAL_BALANCE")}
											</p>

											<div className="flex flex-row items-center text-lg font-semibold leading-[21px] text-theme-secondary-900 dim:text-theme-dim-50 md:text-2xl md:leading-[29px]">
												{profile.tokens().selectedCount() === 0 && (
													<p className="text-theme-secondary-500 dim:text-theme-dim-500 dark:text-theme-dark-500">
														{t("COMMON.NOT_AVAILABLE")}
													</p>
												)}

												{profile.tokens().selectedCount() > 0 && (
													<p className="text-theme-secondary-500 dim:text-theme-dim-500 dark:text-theme-dark-500">
														{t("COMMON.NOT_AVAILABLE")}
													</p>
												)}
											</div>
										</div>
									</div>

									<div className="flex flex-row items-center gap-3">
										<div className="my-auto flex w-full flex-1 md:w-auto">
											<Button
												data-testid="TokensHeader__send-button"
												className="my-auto flex-1 px-8 dim:bg-theme-dim-navy-600 dim:disabled:bg-theme-dim-navy-900 dim:disabled:text-theme-dim-navy-700 dim-hover:bg-theme-dim-navy-700 dim-hover:disabled:bg-theme-dim-navy-900 dim-hover:disabled:text-theme-dim-navy-700 dark:bg-theme-dark-navy-500 dark:hover:bg-theme-dark-navy-700"
												disabled={profile.totalBalance().isZero() && !hasTokenBalance}
												variant="primary"
												onClick={() => handleTokenSend()}
											>
												{t("COMMON.SEND")}
											</Button>
										</div>

										<Button
											data-testid="TokenHeader__receive-modal-toggle"
											variant="secondary"
											size="icon"
											className="text-theme-primary-600 dim:bg-theme-dim-navy-900 dim:text-theme-dim-50 dim-hover:bg-theme-dim-navy-700 dark:hover:bg-theme-dark-navy-700"
											onClick={() => setIsReceiveModalOpen(true)}
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

			<TokenReceiveFunds
				isOpen={isReceiveModalOpen}
				profile={profile}
				wallets={profile.wallets().selected()}
				onClose={() => setIsReceiveModalOpen(false)}
			/>
		</>
	);
};
