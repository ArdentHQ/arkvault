import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import { TableCell, TableRow } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";
import { twMerge } from "tailwind-merge";
import { Contracts } from "@/app/lib/profiles";
import { TokenAddressesDTO } from "@/app/lib/profiles/token-addresses.dto";
import { DefaultToken } from "@/domains/portfolio/components/Tokens/TokensSummary";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Link } from "@/app/components/Link";
import { Icon } from "@/app/components/Icon";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";

export type TokenRowProperties = {
	token: TokenAddressesDTO;
	exchangeCurrency?: string;
	onClick?: () => void;
	isLoading?: boolean;
	profile: Contracts.IProfile;
	decimals?: number;
} & React.HTMLProps<any>;

export const TokenRow = memo(
	({
		className,
		token,
		onClick,
		isLoading = false,
		...properties
	}: TokenRowProperties) => {
		const { isXs, isSm, isXl } = useBreakpoint();
		const { t } = useTranslation();

		if (isXs || isSm) {
			return (
				<div>TODO implement design for xs and sm</div>
			);
		}

		// if (isLoading) {
		// 	return <TransactionRowSkeleton hideSender={hideSender} />;
		// }

		return (
			<TableRow onClick={onClick} className={twMerge("relative", className)} {...properties}>
				<TableCell variant="start">
					<div className="flex flex-row items-center gap-3">
						<DefaultToken tokenName={token.name()} />
						<span className="dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold">{token.name()}</span>
					</div>
				</TableCell>

				<TableCell className="hidden md-lg:table-cell">
					<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px] font-semibold">
						{token.symbol()}
					</div>
				</TableCell>

				<TableCell>
					<Link to="https://example.com" showExternalIcon={false} isExternal={true}>
						<div className="flex w-40 flex-row items-center gap-2 text-sm leading-[17px] font-semibold">
							<TruncateMiddle text={token.token()} className="text-theme-navy-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600" />
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
						ticker={token.symbol()}
						showTicker={false}
						value={Object.values(token.addresses())[0]}
						className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm leading-[17px] font-semibold"
					/>
				</TableCell>

				<TableCell innerClassName="justify-center" className="hidden lg:table-cell">
					<div className="text-theme-secondary-500 dark:text-theme-dark-500 dim:text-theme-dim-500 text-sm font-semibold">
						{t("COMMON.NOT_AVAILABLE")}
					</div>
				</TableCell>

				<TableCell variant="end" innerClassName="justify-end">
					<Button
						size="icon"
						variant="transparent"
						className="text-theme-primary-600 hover:text-theme-primary-700 dark:text-theme-dark-navy-400 dark:hover:text-theme-navy-500 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-700 text-sm hover:underline"
						onClick={() => onClick?.()}
					>
						{t("COMMON.SEND")}
					</Button>
				</TableCell>
			</TableRow>
		);
	},
);
