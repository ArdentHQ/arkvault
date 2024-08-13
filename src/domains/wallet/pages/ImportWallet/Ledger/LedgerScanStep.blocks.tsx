import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Checkbox } from "@/app/components/Checkbox";
import { useRandomNumber } from "@/app/hooks";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

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

export const LedgerMobileItem = ({isLoading, address, balance, coin, isSelected, handleClick}: {
	isLoading: boolean;
	address: string;
	balance?: number;
	coin: string;
	isSelected: boolean;
	handleClick: () => void;
}) => {
	const { t } = useTranslation();
    const amountWidth = useRandomNumber(100, 130);

	if (isLoading) {
		return (
			<div className="border border-theme-secondary-300 bg-white dark:bg-theme-secondary-900 w-full dark:border-theme-secondary-800 rounded overflow-hidden" data-testid="LedgerMobileItem__skeleton">
				<div className="h-11 w-full bg-theme-secondary-100 pl-4 pt-3 dark:bg-black">
					<Skeleton width={20} height={20} />
				</div>

				<div className="w-full pt-2.5 px-4 flex flex-col gap-4 pb-4">
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
		)
	}
	
	return (
		<div className="border border-theme-secondary-300 bg-white dark:bg-theme-secondary-900 w-full dark:border-theme-secondary-800 rounded overflow-hidden" data-testid="LedgerMobileItem__wrapper">
			<div className="h-11 w-full bg-theme-secondary-100 pl-4 pt-3 dark:bg-black">
				<Checkbox checked={isSelected} onChange={handleClick} data-testid="LedgerMobileItem__checkbox" />
			</div>

			<div className="w-full pt-2.5 px-4 flex flex-col gap-4 pb-4">
				<div className="flex flex-col gap-2 w-36">
					<span className="text-theme-secondary-700 text-sm font-semibold dark:text-theme-secondary-500">{t('COMMON.ADDRESS')}</span>
					<Address address={address} showCopyButton addressClass="text-theme-secondary-900 text-sm font-semibold dark:text-theme-secondary-200" />
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-theme-secondary-700 text-sm font-semibold dark:text-theme-secondary-500" data-testid="LedgerMobileItem__network">{t('COMMON.VALUE')} ({coin})</span>
					<AmountWrapper isLoading={false}>
						<Amount value={balance!} ticker={coin} />
					</AmountWrapper>
				</div>
			</div>
		</div>
	)
}