import React from "react";

import { Link } from "@/app/components/Link";
import { useBreakpoint } from "@/app/hooks";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { ExtendedTransactionDTO } from "@/domains/transaction/components/TransactionTable";

export const TransactionRowId = ({ transaction }: { transaction: ExtendedTransactionDTO }) => {
	const { isLgAndAbove, isMdAndAbove, isXl, isSmAndAbove } = useBreakpoint();

	const maxCharacters = () => {
		if (isXl) {
			return 14;
		}

		if (isMdAndAbove) {
			return 12;
		}

		if (isSmAndAbove) {
			return 14;
		}

		return 10;
	};

	return (
		<div className="flex flex-col gap-1 font-semibold">
			{transaction.isSuccess() && (
				<Link to={transaction.explorerLink()} showExternalIcon={false} isExternal>
					<span className="text-sm">
						<TruncateMiddle
							className="cursor-pointer text-theme-primary-600 dim:text-theme-dim-navy-600"
							text={transaction.hash()}
							maxChars={isLgAndAbove ? 14 : 12}
							data-testid="TransactionRow__id"
						/>
					</span>
				</Link>
			)}
			{!transaction.isSuccess() && transaction.blockHash() && (
				<Tooltip content={transaction.hash()}>
					<Link to={transaction.explorerLink()} showExternalIcon={false} isExternal>
						<span className="flex h-[21px] items-center justify-between space-x-2 rounded bg-theme-danger-50 px-1.5 py-[2px] text-sm dim:border dim:border-theme-danger-info-border dim:bg-transparent dark:border dark:border-theme-danger-info-border dark:bg-transparent">
							<TruncateMiddle
								className="cursor-pointer border-b border-b-transparent leading-[17px] text-theme-danger-700 hover:border-theme-danger-700 dim:text-theme-danger-info-border dim-hover:border-theme-danger-info-border dark:text-theme-danger-info-border dark:hover:border-theme-danger-info-border"
								text={transaction.hash()}
								maxChars={maxCharacters()}
								data-testid="TransactionRow__id"
							/>

							<Icon
								name="CrossSmall"
								className="text-theme-danger-700 dim:text-theme-danger-info-border dark:text-theme-danger-info-border"
								width={12}
								height={12}
							/>
						</span>
					</Link>
				</Tooltip>
			)}
			{!transaction.isSuccess() && !transaction.blockHash() && (
				<Tooltip content={transaction.hash()}>
					<Link to={transaction.explorerLink()} showExternalIcon={false} isExternal>
						<span className="flex h-[21px] items-center justify-between space-x-1 rounded bg-theme-secondary-200 px-1.5 py-[2px] text-sm dim:border dim:border-theme-dim-700 dim:bg-transparent dark:border dark:border-theme-dark-700 dark:bg-transparent">
							<TruncateMiddle
								className="cursor-pointer border-b border-b-transparent leading-[17px] text-theme-primary-600 hover:border-theme-primary-600 dim:text-theme-dim-200 dim-hover:border-theme-dim-200 dark:text-theme-secondary-500 dark:hover:border-theme-secondary-500"
								text={transaction.hash()}
								maxChars={maxCharacters()}
								data-testid="TransactionRow__id"
							/>

							<Icon
								name="Hourglass"
								className="text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500"
								width={12}
								height={12}
							/>
						</span>
					</Link>
				</Tooltip>
			)}
		</div>
	);
};

TransactionRowId.displayName = "TransactionRowId";
