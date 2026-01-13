import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import { TableCell, TableRow } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";
import { twMerge } from "tailwind-merge";
import { Contracts } from "@/app/lib/profiles";
import { TokenNameInitials } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Link } from "@/app/components/Link";
import { Icon } from "@/app/components/Icon";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokenRowSkeleton } from "./TokenRowSkeleton";
import { TokenRowMobile } from "@/domains/tokens/components/TokenRow/TokenRowMobile";
import { Checkbox } from "@/app/components/Checkbox";

export type TokenRowProperties = {
	walletToken: WalletToken;
	exchangeCurrency?: string;
	onClick?: () => void;
	onSend: () => void;
	isLoading?: boolean;
	profile: Contracts.IProfile;
	decimals?: number;
	isManageMode?: boolean;
	isHidden?: boolean;
	toggleContractVisibility: (address: string) => void;
} & React.HTMLProps<any>;

export const TokenRow = memo(
	({
		className,
		walletToken,
		onClick,
		onSend,
		isManageMode,
		isHidden,
		isLoading = false,
		toggleContractVisibility,
		...properties
	}: TokenRowProperties) => {
		const { isXs, isSm } = useBreakpoint();
		const { t } = useTranslation();

		if (isXs || isSm) {
			return (
				<TokenRowMobile
					isLoading={isLoading}
					walletToken={walletToken}
					onSend={onSend}
					onClick={onClick}
					isManageMode={isManageMode}
					isHidden={isHidden}
					toggleContractVisibility={toggleContractVisibility}
					{...properties}
				/>
			);
		}

		if (isLoading) {
			return <TokenRowSkeleton />;
		}

		return (
			<TableRow onClick={onClick} className={twMerge("relative", className)} {...properties}>
				{!isManageMode && (
					<TableCell variant="start" innerClassName="pl-2!">
						<Button
							size="icon"
							variant="transparent"
							className="p-1"
							onClick={(event) => {
								/* istanbul ignore next -- @preserve */
								event.stopPropagation();
								console.log("star clicked");
							}}
						>
							<Icon name="Star" className="text-theme-warning-400" />
						</Button>
					</TableCell>
				)}

				{isManageMode && (
					<TableCell variant="start">
						<Checkbox
							data-testid="CreateWallet__ConfirmPassphraseStep__passphraseDisclaimer"
							checked={!isHidden}
							className="mt-1 sm:mt-0.5"
							onChange={() => {
								toggleContractVisibility(walletToken.token().address())
							}}
							onClick={(event) => {
								event.stopPropagation();
							}}
						/>
					</TableCell>
				)}

				<TableCell>
					<div className="flex flex-row items-center gap-3">
						<TokenNameInitials tokenName={walletToken.token().name()} />
						<span className="dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold">
							{walletToken.token().name()}
						</span>
					</div>
				</TableCell>

				<TableCell className="md-lg:table-cell hidden">
					<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px] font-semibold">
						{walletToken.token().symbol()}
					</div>
				</TableCell>

				<TableCell>
					<Link to={walletToken.contractExplorerLink()} showExternalIcon={false} isExternal={true}>
						<div className="flex w-40 flex-row items-center gap-2 text-sm leading-[17px] font-semibold">
							<TruncateMiddle
								text={walletToken.token().address()}
								className="text-theme-navy-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600"
							/>
							<Icon
								data-testid="Link__external"
								name="ArrowExternal"
								dimensions={[12, 12]}
								className="text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500 shrink-0 align-middle duration-200"
							/>
						</div>
					</Link>
				</TableCell>

				<TableCell innerClassName="justify-end">
					<Amount
						ticker={walletToken.token().symbol()}
						showTicker={false}
						value={walletToken.balance()}
						className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px] font-semibold"
					/>
				</TableCell>

				<TableCell innerClassName="justify-center" className="hidden lg:table-cell">
					<div className="text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500 text-sm font-semibold">
						{t("COMMON.NOT_AVAILABLE")}
					</div>
				</TableCell>

				<TableCell variant="end" innerClassName="justify-end">
					{!isManageMode && (
						<Button
							size="icon"
							variant="transparent"
							className="text-theme-primary-600 hover:text-theme-primary-700 dark:text-theme-dark-navy-400 dark:hover:text-theme-navy-500 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-700 p-1 text-sm leading-[17px] hover:underline"
							onClick={(event) => {
								event.stopPropagation();
								onSend();
							}}
						>
							{t("COMMON.SEND")}
						</Button>
					)}

					{isManageMode && (
						<Button
							size="icon"
							variant="transparent"
							className="text-theme-danger-400 hover:text-theme-danger-500 dark:text-theme-danger-400 dark:hover:text-theme-danger-300 dim:text-theme-danger-400 dim-hover:text-theme-danger-300 p-1 text-sm leading-[17px] hover:underline"
							onClick={(event) => {
								event.stopPropagation();
							}}
						>
							<Icon name="Trash" />
							{t("COMMON.REMOVE")}
						</Button>
					)}
				</TableCell>
			</TableRow>
		);
	},
);
