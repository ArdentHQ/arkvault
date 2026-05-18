import { DetailsCondensed, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { useEffect, useState } from "react";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { useTranslation } from "react-i18next";
import { Amount } from "@/app/components/Amount";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { Icon } from "@/app/components/Icon";
import cn from "classnames";
import { Address } from "@/app/components/Address";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import { Button } from "@/app/components/Button";
import { SIDE_PANEL_TRANSITION_DURATION } from "@/app/contexts";

const TokenDetailSidepanelFooter = ({ onClose, onSendToken }: { onClose?: () => void; onSendToken?: () => void }) => {
	const { t } = useTranslation();
	return (
		<SidePanelButtons>
			<>
				<Button variant="secondary" onClick={onClose} data-testid="TokenDetailSidepanel__close-button">
					{t("COMMON.CLOSE")}
				</Button>

				<Button
					className="hidden md:block"
					data-testid="TokenDetailSidepanel__send-button"
					onClick={onSendToken}
				>
					{t("COMMON.SEND_TOKENS")}
				</Button>

				<Button className="md:hidden" onClick={onSendToken}>
					{t("COMMON.SEND")}
				</Button>
			</>
		</SidePanelButtons>
	);
};

export const TokenDetailSidepanel = ({
	isOpen: isSidePanelOpen,
	walletToken,
	onClose,
	onSendToken,
	onReloadToken,
	isReloading,
}: {
	isOpen: boolean;
	walletToken: WalletToken;
	onClose?: () => void;
	onSendToken?: (tokenAddress?: string) => void;
	onReloadToken?: () => void;
	isReloading?: boolean;
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(isSidePanelOpen);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout | undefined;

		if (!isOpen) {
			timeoutId = setTimeout(() => {
				onClose?.();
			}, SIDE_PANEL_TRANSITION_DURATION);
		}

		return () => clearTimeout(timeoutId);
	}, [isOpen]);

	return (
		<SidePanel
			title={t("TOKENS.TOKEN_INFORMATION")}
			open={isOpen}
			onOpenChange={setIsOpen}
			footer={
				<TokenDetailSidepanelFooter
					onClose={() => setIsOpen(false)}
					onSendToken={() => {
						onSendToken?.(walletToken.token().address());
						setIsOpen(false);
					}}
				/>
			}
		>
			<DetailsCondensed>
				<div className="space-y-4" data-testid="TokenDetailSidepanel">
					<div className="dark:bg-theme-dark-950 dim:bg-theme-dim-950 dark:text-theme-dark-50 bg-theme-primary-100 dim:text-theme-dim-50 rounded-xl border-none px-6 py-3 sm:border">
						<div className="flex justify-between">
							<div className="flex w-full items-center space-x-2 truncate">
								<TokenNameInitials
									tokenName={walletToken.token().name()}
									className="text-md h-8 w-8 shrink-0 p-3 leading-8"
								/>
								<div className="w-full truncate text-lg leading-4 font-semibold">
									{walletToken.token().name()}
								</div>
							</div>

							<div className="flex shrink-0 items-center space-x-4">
								<Button
									variant="secondary"
									className="dark:text-theme-dark-50 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 hover:bg-theme-primary-200 hover:text-theme-primary-700 dim:bg-transparent dim:text-theme-dim-200 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 flex h-6 w-6 items-center justify-center p-0 sm:h-8 sm:w-auto sm:px-2 dark:bg-transparent"
									onClick={onReloadToken}
									data-testid="TokenDetailSidepanel__reload-button"
								>
									<Icon
										name="ArrowRotateLeft"
										style={{ animationDirection: "reverse" }}
										className={cn(
											"text-theme-navy-600 dark:text-theme-dark-200 dark:hover:text-theme-dark-50 hover:text-theme-primary-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50",
											{
												"animate-spin": isReloading,
											},
										)}
									/>
								</Button>
							</div>
						</div>
					</div>

					<DetailWrapper label={t("COMMON.BALANCE")} className="rounded-xl">
						<div className="space-y-3">
							<div className="flex items-start justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6 lg:pt-0.5">
									{t("COMMON.AMOUNT")}
								</DetailTitle>

								<div className="flex w-full flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
									<Amount
										ticker={walletToken.token().symbol()}
										value={walletToken.balance()}
										className="text-sm font-semibold break-all whitespace-normal md:text-base"
										showTicker={false}
									/>
								</div>
							</div>

							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">{t("COMMON.FIAT")}</DetailTitle>

								<div className="text-theme-secondary-500 dark:text-theme-dark-500 flex flex-1 flex-row items-center justify-end gap-2 text-sm leading-[17px] font-semibold sm:w-full sm:justify-start sm:text-base sm:leading-5">
									{t("COMMON.NOT_AVAILABLE")}
								</div>
							</div>
						</div>
					</DetailWrapper>

					<DetailWrapper label={t("COMMON.DETAILS")} className="rounded-xl">
						<div className="space-y-3">
							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">{t("COMMON.SYMBOL")}</DetailTitle>

								<div className="text-sm leading-[17px] font-semibold break-all whitespace-normal sm:text-base sm:leading-5">
									{walletToken.token().symbol()}
								</div>
							</div>

							<div className="flex justify-between space-x-2 sm:justify-start sm:space-x-0 md:items-center">
								<DetailTitle className="w-auto pt-1 sm:min-w-28 sm:pr-6 md:pt-0">
									{t("COMMON.CONTRACT")}
								</DetailTitle>

								<div className="flex flex-1 flex-col justify-end gap-2 sm:w-full sm:justify-start md:flex-row md:items-center">
									<Address
										address={walletToken.token().address()}
										showCopyButton
										walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
										wrapperClass="justify-end sm:justify-start"
										addressClass={cn(
											"text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4",
										)}
									/>

									<div className="hidden md:block">
										<Divider type="vertical" />
									</div>

									<Link
										isExternal
										to={walletToken.contractExplorerLink()}
										className="flex items-center justify-end whitespace-nowrap"
									>
										{t("COMMON.EXPLORER")}
									</Link>
								</div>
							</div>

							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">{t("COMMON.DECIMALS")}</DetailTitle>

								<div className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
									{walletToken.token().decimals()}
								</div>
							</div>

							<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
								<DetailTitle className="w-auto sm:min-w-28 sm:pr-6">{t("COMMON.SUPPLY")}</DetailTitle>

								<div className="flex w-full flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
									<Amount
										ticker={walletToken.token().symbol()}
										value={walletToken.token().totalSupply()}
										className="text-sm leading-[17px] font-semibold break-all whitespace-normal sm:text-base sm:leading-5"
										showTicker={false}
									/>
								</div>
							</div>
						</div>
					</DetailWrapper>
				</div>
			</DetailsCondensed>
		</SidePanel>
	);
};
