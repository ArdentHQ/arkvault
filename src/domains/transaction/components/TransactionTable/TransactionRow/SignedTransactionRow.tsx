import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { MouseEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { TableCell, TableRow } from "@/app/components/Table";
import { TableRemoveButton } from "@/app/components/TableRemoveButton";
import { Tooltip } from "@/app/components/Tooltip";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";
import { getMultiSignatureInfo } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";
import { assertString } from "@/utils/assertions";
import { TimeAgo } from "@/app/components/TimeAgo";
import { DateTime } from "@ardenthq/sdk-intl";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { Label } from "@/app/components/Label";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/Icon";
import { TransactionRowAddressing } from "./TransactionRowAddressing";
import { TransactionAmountLabel, TransactionFiatAmount } from "./TransactionAmount.blocks";

interface SignedTransactionRowProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	onRowClick?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onRemovePendingTransaction?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	wallet: Contracts.IReadWriteWallet;
}

interface SignButtonProperties {
	isAwaitingFinalSignature: boolean;
	isAwaitingOurFinalSignature: boolean;
	canBeSigned: boolean;
	onClick?: () => void;
	className?: string;
}

export const SignButton = ({
	className,
	isAwaitingFinalSignature,
	isAwaitingOurFinalSignature,
	canBeSigned,
	onClick,
}: SignButtonProperties) => {
	const { t } = useTranslation();

	if (!canBeSigned && !isAwaitingOurFinalSignature) {
		return (
			<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-600">
				{t("COMMON.WAITING")}...
			</span>
		);
	}

	const ButtonContent = () => {
		if (isAwaitingFinalSignature || isAwaitingOurFinalSignature) {
			return (
				<>
					<span>{t("COMMON.SEND")}</span>
				</>
			);
		}

		return (
			<>
				<span>{t("COMMON.SIGN")}</span>
			</>
		);
	};

	return (
		<Button
			size="sm"
			data-testid="TransactionRow__sign"
			variant="transparent"
			className={`p-0 text-theme-primary-600 hover:text-theme-primary-500 hover:underline ${className}`}
			onClick={onClick}
		>
			<ButtonContent />
		</Button>
	);
};

export const SignedTransactionRow = ({
	transaction,
	onRowClick,
	wallet,
	onRemovePendingTransaction,
}: SignedTransactionRowProperties) => {
	const { t } = useTranslation();
	const { getLabel } = useTransactionTypes();
	const { canBeSigned, isAwaitingFinalSignature, isAwaitingOurFinalSignature, status } = useMultiSignatureStatus({
		transaction,
		wallet,
	});

	const canBeDeleted = useMemo(() => {
		const publicKey = transaction.wallet().publicKey();

		assertString(publicKey);

		const musigInfo = getMultiSignatureInfo(transaction);
		return musigInfo.publicKeys.includes(publicKey);
	}, [transaction]);

	const handleRemove = (event?: MouseEvent) => {
		event?.preventDefault();
		event?.stopPropagation();

		onRemovePendingTransaction?.(transaction);
	};

	return (
		<TableRow className="relative">
			<TableCell variant="start" innerClassName="items-start my-0 py-3 xl:min-h-0">
				<div className="flex flex-col gap-1 font-semibold">
					<span className="text-sm">
						<TruncateMiddle
							className="cursor-pointer text-theme-primary-600"
							text={transaction.id()}
							maxChars={14}
							onClick={() => onRowClick?.(transaction)}
							data-testid="TransactionRow__transaction-id"
						/>
					</span>
					<span className="text-xs text-theme-secondary-700 xl:hidden">
						<TimeAgo date={DateTime.fromUnix(transaction.timestamp().toUNIX()).toISOString()} />
					</span>
				</div>
			</TableCell>

			<TableCell
				className="hidden xl:table-cell"
				innerClassName="text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold items-start pt-3 xl:pt-0 xl:min-h-0"
			>
				<TimeAgo date={DateTime.fromUnix(transaction.timestamp().toUNIX()).toISOString()} />
			</TableCell>

			<TableCell innerClassName="items-start xl:min-h-0">
				<Label
					color="secondary"
					size="xs"
					noBorder
					className="rounded px-1 dark:border"
					data-testid="TransactionRowRecipientLabel"
				>
					{getLabel(transaction.type())}
				</Label>
			</TableCell>

			<TableCell innerClassName="space-x-2 items-start xl:min-h-0">
				<TransactionRowAddressing transaction={transaction} profile={transaction.wallet().profile()} />
			</TableCell>

			<TableCell
				className="hidden w-16 lg:table-cell"
				innerClassName="items-start justify-center truncate hidden lg:flex xl:min-h-0"
			>
				<Tooltip content={status.label}>
					<span className="text-theme-secondary-700">
						<Icon name={status.icon} size="md" />
					</span>
				</Tooltip>
			</TableCell>

			<TableCell innerClassName="justify-end items-start xl:min-h-0">
				<div className="flex flex-col items-end gap-1">
					<TransactionAmountLabel transaction={transaction} />
					<span className="text-xs font-semibold text-theme-secondary-700 lg:hidden">
						<TransactionFiatAmount transaction={transaction} exchangeCurrency={wallet.exchangeCurrency()} />
					</span>
				</div>
			</TableCell>

			<TableCell
				className="hidden lg:table-cell"
				innerClassName="justify-end items-start text-sm text-theme-secondary-900 dark:text-theme-secondary-200 font-semibold xl:min-h-0"
			>
				<TransactionFiatAmount transaction={transaction} exchangeCurrency={wallet.exchangeCurrency()} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end items-start text-sm xl:min-h-0">
				<div className="flex flex-row items-center">
					<SignButton
						canBeSigned={canBeSigned}
						isAwaitingFinalSignature={isAwaitingFinalSignature}
						isAwaitingOurFinalSignature={isAwaitingOurFinalSignature}
						onClick={() => onRowClick?.(transaction)}
					/>
					<Divider
						type="vertical"
						className="m-0 border-theme-secondary-300 dark:border-theme-secondary-800"
					/>
					<Tooltip
						content={
							canBeDeleted
								? undefined
								: t("TRANSACTION.MULTISIGNATURE.PARTICIPANTS_CAN_REMOVE_PENDING_MUSIG")
						}
					>
						<div className="flex items-center">
							<TableRemoveButton isDisabled={!canBeDeleted} onClick={handleRemove} className="m-0 p-1" />
						</div>
					</Tooltip>
				</div>
			</TableCell>
		</TableRow>
	);
};
