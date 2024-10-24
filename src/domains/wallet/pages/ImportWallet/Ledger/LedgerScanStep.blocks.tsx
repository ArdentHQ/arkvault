import React, { ReactNode } from "react";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Checkbox } from "@/app/components/Checkbox";
import { useRandomNumber } from "@/app/hooks";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { MobileSection } from "@/app/components/Table/Mobile/MobileSection";
import { MobileCard } from "@/app/components/Table/Mobile/MobileCard";
import { Spinner } from "@/app/components/Spinner";
import { Trans } from "react-i18next";
import { twMerge } from "tailwind-merge";

export const AmountWrapper = ({ isLoading, children }: { isLoading: boolean; children?: React.ReactNode }) => {
	const amountWidth = useRandomNumber(100, 130);

	if (isLoading) {
		return (
			<span data-testid="LedgerScanStep__amount-skeleton" className="flex items-center space-x-1">
				<Skeleton height={16} width={amountWidth} />
				<Skeleton height={16} width={35} />
			</span>
		);
	}

	return <div>{children}</div>;
};

export const LedgerMobileItem = ({
	isLoading,
	address,
	balance,
	coin,
	isSelected,
	handleClick,
	index = 0,
}: {
	isLoading: boolean;
	address: string;
	balance?: number;
	coin: string;
	isSelected: boolean;
	handleClick: () => void;
	index?: number;
}) => {
	const { t } = useTranslation();
	const amountWidth = useRandomNumber(100, 130);

	if (isLoading) {
		return (
			<div className="relative">
				<div
					className="w-full overflow-hidden rounded border border-theme-secondary-300 bg-white dark:border-theme-secondary-800 dark:bg-theme-secondary-900"
					data-testid="LedgerMobileItem__skeleton"
				>
					<div className="h-11 w-full bg-theme-secondary-100 pl-4 pt-3 dark:bg-black">
						<Skeleton width={20} height={20} />
					</div>

					<div className="flex w-full flex-col gap-4 px-4 pb-4 pt-2.5">
						<div className="flex flex-col gap-2">
							<Skeleton height={16} width={126} />
							<Skeleton height={16} width={amountWidth} />
						</div>
						<div className="flex flex-col gap-2">
							<Skeleton height={16} width={126} />
							<Skeleton height={16} width={amountWidth} />
						</div>
					</div>
				</div>

				{index > 0 && <LedgerLoaderOverlay />}

				{index === 0 && (
					<LedgerLoaderOverlay>
						<Trans
							i18nKey="WALLETS.PAGE_IMPORT_WALLET.LEDGER_SCAN_STEP.LOADING_WALLETS"
							values={{ count: 5 }}
						/>
					</LedgerLoaderOverlay>
				)}
			</div>
		);
	}

	return (
		<MobileCard data-testid="LedgerMobileItem__wrapper">
			<div className="h-11 w-full bg-theme-secondary-100 pl-4 pt-3 dark:bg-black">
				<Checkbox checked={isSelected} onChange={handleClick} data-testid="LedgerMobileItem__checkbox" />
			</div>

			<div className="flex w-full flex-col gap-4 px-4 pb-4 pt-2.5">
				<MobileSection title={t("COMMON.ADDRESS")}>
					<Address
						address={address}
						showCopyButton
						addressClass="text-theme-secondary-900 text-sm font-semibold dark:text-theme-secondary-200"
					/>
				</MobileSection>
				<MobileSection title={`${t("COMMON.VALUE")} (${coin})`} data-testid="LedgerMobileItem__network">
					<AmountWrapper isLoading={false}>
						<Amount value={balance!} ticker={coin} />
					</AmountWrapper>
				</MobileSection>
			</div>
		</MobileCard>
	);
};

export const LedgerLoaderOverlay = ({ children, className }: { className?: string; children?: ReactNode }) => (
	<div>
		<div
			className={twMerge(
				"absolute inset-0 -m-px rounded border border-theme-secondary-300 bg-theme-secondary-900 opacity-75 dark:border-theme-secondary-800",
				className,
			)}
		/>
		<div className="absolute inset-0 flex h-full w-full items-center justify-center space-x-3">
			{children && (
				<div>
					<Spinner />
				</div>
			)}
			<div>{children}</div>
		</div>
	</div>
);
