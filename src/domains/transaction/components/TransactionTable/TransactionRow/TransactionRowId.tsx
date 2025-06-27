import React from "react";
import { DTO } from "@/app/lib/profiles";

import { Link } from "@/app/components/Link";
import { useBreakpoint } from "@/app/hooks";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";

export const TransactionRowId = ({ transaction }: { transaction: DTO.ExtendedConfirmedTransactionData }) => {
	const { isLgAndAbove, isMdAndAbove, isXs, isXl, isSmAndAbove } = useBreakpoint();

	const maxCharacters = () => {
		if (isXl) {
			return 14
		}

		if (isLgAndAbove) {
			return 10
		}

		if (isMdAndAbove) {
			return 8

		}

		if (isXs || isSmAndAbove) {
			return 14

		}
	}

	return (
		<div className="flex flex-col gap-1 font-semibold">
			{transaction.isSuccess() && (
				<Link to={transaction.explorerLink()} showExternalIcon={false} isExternal>
					<span className="text-sm">
						<TruncateMiddle
							className="text-theme-primary-600 cursor-pointer"
							text={transaction.hash()}
							maxChars={isLgAndAbove ? 14 : 12}
							data-testid="TransactionRow__id"
						/>
					</span>
				</Link>
			)}
			{!transaction.isSuccess() && (
				<Link to={transaction.explorerLink()} showExternalIcon={false} isExternal>
					<Tooltip content={transaction.hash()}>
						<span className="bg-theme-danger-50 dark:border-theme-danger-info-border flex h-[21px] items-center space-x-2 rounded px-1.5 py-[2px] text-sm dark:border dark:bg-transparent">
							<TruncateMiddle
								className="text-theme-danger-700 dark:text-theme-danger-info-border dark:hover:border-theme-danger-info-border hover:border-theme-danger-700 cursor-pointer border-b border-b-transparent leading-[17px]"
								text={transaction.hash()}
								maxChars={maxCharacters()}
								data-testid="TransactionRow__id"
							/>

							<Icon
								name="CircleMinus"
								className="text-theme-danger-700 dark:text-theme-danger-info-border"
								width={12}
								height={12}
							/>
						</span>
					</Tooltip>
				</Link>
			)}
		</div>
	);
};

TransactionRowId.displayName = "TransactionRowId";
