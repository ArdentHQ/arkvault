import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { TimeAgo } from "@/app/components/TimeAgo";
import { DateTime } from "@ardenthq/sdk-intl";
import { Label } from "@/app/components/Label";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { Amount, AmountLabel } from "@/app/components/Amount";

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
	const { getLabel } = useTransactionTypes();
	const timeStamp = transaction.timestamp();

	return (
		<TableRow className="relative" onClick={() => onRowClick?.(transaction)}>
			<TableCell variant="start" isCompact={isCompact} innerClassName="items-start my-0 py-3 xl:min-h-0">
				<div className="flex flex-col gap-1 font-semibold">
					<span className="text-sm">
						<TruncateMiddle
							className="cursor-pointer text-theme-primary-600"
							text={transaction.id()}
							maxChars={14}
							onClick={() => onRowClick?.(transaction)}
							data-testId="PendingTransactionRow__transaction-id"
						/>
					</span>
					<span className="text-xs text-theme-secondary-700 xl:hidden">
						{timeStamp ? (
							<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
						) : (
							t("COMMON.NOT_AVAILABLE")
						)}
					</span>
				</div>
			</TableCell>

			<TableCell
				className="hidden lg:table-cell"
				innerClassName="text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold items-start xl:min-h-0 my-0 py-3"
				isCompact={isCompact}
			>
				{timeStamp ? (
					<TimeAgo date={DateTime.fromUnix(timeStamp.toUNIX()).toISOString()} />
				) : (
					t("COMMON.NOT_AVAILABLE")
				)}
			</TableCell>

			<TableCell isCompact={isCompact} innerClassName="items-start xl:min-h-0 my-0 py-3">
				<Label color="secondary" size="xs" noBorder className="rounded p-1">
					{getLabel(transaction.type())}
				</Label>
			</TableCell>

			<TableCell innerClassName="space-x-2 items-start xl:min-h-0 my-0 py-3" isCompact={isCompact}>
				<Label color="danger-bg" size="xs" noBorder className="rounded px-[11px] py-1">
					{t("COMMON.TO")}
				</Label>
				<span className="text-sm">
					<TruncateMiddle
						className="cursor-pointer font-semibold text-theme-primary-600"
						text={transaction.recipient() || ""}
						maxChars={14}
						data-testId="PendingTransactionRowRecipientLabel"
					/>
				</span>
			</TableCell>

			<TableCell
				className="hidden w-16 lg:table-cell"
				innerClassName="items-start justify-center truncate hidden lg:flex xl:min-h-0 my-0 py-3"
				isCompact={isCompact}
			>
				<Tooltip content={t("TRANSACTION.MULTISIGNATURE.AWAITING_CONFIRMATIONS")}>
					<span className="text-theme-secondary-700">
						<Icon name="Clock" size="md" />
					</span>
				</Tooltip>
			</TableCell>

			<TableCell isCompact={isCompact} innerClassName="justify-end items-start xl:min-h-0 my-0 py-3">
				<div className="flex flex-col items-end gap-1">
					<AmountLabel
						value={transaction.amount() + transaction.fee()}
						isNegative={true}
						ticker={wallet.currency()}
						isCompact
					/>
					<span className="text-xs font-semibold text-theme-secondary-700 lg:hidden">
						<Amount value={wallet.convertedBalance()} ticker={wallet.exchangeCurrency()} />
					</span>
				</div>
			</TableCell>

			<TableCell
				isCompact={isCompact}
				className="hidden lg:table-cell"
				innerClassName="justify-end items-start text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold xl:min-h-0 my-0 py-3"
			>
				<Amount value={wallet.convertedBalance()} ticker={wallet.exchangeCurrency()} />
			</TableCell>

			<TableCell
				isCompact={isCompact}
				innerClassName="items-start xl:min-h-0 my-0 py-3"
				className="text-sm text-theme-secondary-500"
				variant="end"
			>
				<div className="flex flex-row items-center">{t("TRANSACTION.WAITING")}...</div>
			</TableCell>
		</TableRow>
	);
};
