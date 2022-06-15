import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { BaseTransactionRowAmount } from "./TransactionRowAmount";
import { BaseTransactionRowMode } from "./TransactionRowMode";
import { BaseTransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { useTimeFormat } from "@/app/hooks/use-time-format";

export const PendingTransferRow = ({
	transaction,
	onRowClick,
	wallet,
	isCompact,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	onRowClick?: (transaction: DTO.ExtendedConfirmedTransactionData) => void;
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
}) => {
	const { t } = useTranslation();
	const timeFormat = useTimeFormat();

	return (
		<TableRow onClick={() => onRowClick?.(transaction)}>
			<TableCell variant="start" isCompact={isCompact}>
				<Tooltip content={transaction.id()}>
					<span className="text-theme-secondary-300 dark:text-theme-secondary-800">
						<Icon name="MagnifyingGlassId" />
					</span>
				</Tooltip>
			</TableCell>

			<TableCell
				className="hidden lg:table-cell"
				innerClassName="text-theme-secondary-text"
				isCompact={isCompact}
			>
				<span data-testid="TransactionRow__timestamp">{transaction?.timestamp()?.format(timeFormat)}</span>
			</TableCell>

			<TableCell innerClassName="space-x-4" isCompact={isCompact}>
				<BaseTransactionRowMode
					isCompact={isCompact}
					isSent={transaction.isSent()}
					isReturn={transaction.isReturn()}
					type={transaction.type()}
					address={transaction.recipient()}
				/>

				<BaseTransactionRowRecipientLabel type={transaction.type()} recipient={transaction.recipient()} />
			</TableCell>

			<TableCell className="w-16" innerClassName="justify-center truncate" isCompact={isCompact}>
				<Tooltip content={t("TRANSACTION.MULTISIGNATURE.AWAITING_CONFIRMATIONS")}>
					<span className="p-1 text-theme-warning-300">
						<Icon name="Clock" size="lg" />
					</span>
				</Tooltip>
			</TableCell>

			<TableCell innerClassName="justify-end" isCompact={isCompact}>
				<BaseTransactionRowAmount
					isSent={transaction?.isSent?.()}
					total={transaction.amount() + transaction.fee()}
					wallet={wallet}
					isCompact={isCompact}
				/>
			</TableCell>

			<TableCell
				variant="end"
				innerClassName="justify-end"
				className="text-theme-secondary-500"
				isCompact={isCompact}
			>
				{t("TRANSACTION.WAITING")}...
			</TableCell>
		</TableRow>
	);
};
