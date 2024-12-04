import React from "react";
import { DTO } from "@ardenthq/sdk-profiles";

import { Link } from "@/app/components/Link";
import { useBreakpoint } from "@/app/hooks";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { Icon } from "@/app/components/Icon";
import { AddressLabel } from "@/app/components/Address";

export const TransactionRowId = ({ transaction }: { transaction: DTO.ExtendedConfirmedTransactionData }) => {
	const { isLgAndAbove } = useBreakpoint();

	return (
		<div className="flex flex-col gap-1 font-semibold">
			{transaction.isSuccess() && (
				<Link to={transaction.explorerLink()} showExternalIcon={false} isExternal>
					<span className="text-sm">
						<TruncateMiddle
							className="cursor-pointer text-theme-primary-600"
							text={transaction.id()}
							maxChars={isLgAndAbove ? 14 : 12}
							data-testid="TransactionRow__id"
						/>
					</span>
				</Link>
			)}
			{!transaction.isSuccess() && (
				<Link to={transaction.explorerLink()} showExternalIcon={false} isExternal>
					<span className="flex h-[21px] items-center space-x-2 rounded bg-theme-danger-50 px-1.5 py-[2px] text-sm dark:border dark:border-theme-danger-info-border dark:bg-transparent">
						<AddressLabel
							className="cursor-pointer border-b border-b-transparent leading-[17px] text-theme-danger-700 hover:border-theme-danger-700 dark:text-theme-danger-info-border dark:hover:border-theme-danger-info-border"
							data-testid="TransactionRow__id"
						>
							{transaction.id()}
						</AddressLabel>
						<Icon
							name="CircleMinus"
							className="text-theme-danger-700 dark:text-theme-danger-info-border"
							width={12}
							height={12}
						/>
					</span>
				</Link>
			)}
		</div>
	);
};

TransactionRowId.displayName = "TransactionRowId";
