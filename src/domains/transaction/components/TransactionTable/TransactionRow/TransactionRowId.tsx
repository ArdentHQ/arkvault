import React from "react";
import { DTO } from "@/app/lib/profiles";

import { Link } from "@/app/components/Link";
import { useBreakpoint } from "@/app/hooks";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";

export const TransactionRowId = ({ transaction }: { transaction: DTO.ExtendedConfirmedTransactionData }) => {
	const { isLgAndAbove } = useBreakpoint();

	return (
		<div className="flex flex-col gap-1 font-semibold">
			{transaction.isSuccess() && (
				<Link to={transaction.explorerLink()} showExternalIcon={false} isExternal>
					<span className="text-sm">
						<TruncateMiddle
							className="cursor-pointer text-theme-primary-600"
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
						<span className="flex items-center px-1.5 space-x-2 text-sm rounded dark:bg-transparent dark:border bg-theme-danger-50 h-[21px] py-[2px] dark:border-theme-danger-info-border">
							<TruncateMiddle
								className="border-b cursor-pointer text-theme-danger-700 border-b-transparent leading-[17px] dark:text-theme-danger-info-border dark:hover:border-theme-danger-info-border hover:border-theme-danger-700"
								text={transaction.hash()}
								maxChars={isLgAndAbove ? 14 : 12}
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
