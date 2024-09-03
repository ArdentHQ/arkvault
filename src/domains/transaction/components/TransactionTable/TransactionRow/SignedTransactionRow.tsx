import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { MouseEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/app/components/Button";
import { TableCell, TableRow } from "@/app/components/Table";
import { TableRemoveButton } from "@/app/components/TableRemoveButton";
import { Tooltip } from "@/app/components/Tooltip";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";
import { DropdownOption } from "@/app/components/Dropdown";
import { getMultiSignatureInfo } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";
import { assertString } from "@/utils/assertions";
import { TimeAgo } from "@/app/components/TimeAgo";
import { DateTime } from "@ardenthq/sdk-intl";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { Label } from "@/app/components/Label";
import { AmountLabel } from "@/app/components/Amount";
import { Divider } from "@/app/components/Divider";

interface SignedTransactionRowProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	onSign?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onRowClick?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onRemovePendingTransaction?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
}

interface SignButtonProperties {
	isCompact: boolean;
	isAwaitingFinalSignature: boolean;
	isAwaitingOurFinalSignature: boolean;
	canBeSigned: boolean;
	onClick?: () => void;
	className?: string;
}

export const SignButton = ({
	className,
	isCompact,
	isAwaitingFinalSignature,
	isAwaitingOurFinalSignature,
	canBeSigned,
	onClick,
}: SignButtonProperties) => {
	const { t } = useTranslation();

	if (!canBeSigned && !isAwaitingOurFinalSignature) {
		return <span className="text-sm text-theme-secondary-500 dark:text-theme-secondary-600 font-semibold">{t("COMMON.WAITING")}...</span>;
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

	if (isCompact) {
		return (
			<Button
				size="sm"
				data-testid="TransactionRow__sign"
				variant="transparent"
				className={`text-theme-primary-600 hover:text-theme-primary-700 p-0 ${className}`}
				onClick={onClick}
			>
				<ButtonContent />
			</Button>
		);
	}

	return (
		<Button
			data-testid="TransactionRow__sign"
			variant={isAwaitingFinalSignature ? "primary" : "secondary"}
			onClick={onClick}
			className={className}
		>
			<ButtonContent />
		</Button>
	);
};

export const SignedTransactionRow = ({
	transaction,
	onSign,
	onRowClick,
	wallet,
	isCompact,
	onRemovePendingTransaction,
}: SignedTransactionRowProperties) => {
	const { t } = useTranslation();
	const timeFormat = useTimeFormat();
	const { getLabel } = useTransactionTypes();
	const recipient = transaction.get<string>("recipientId");
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

	const dropdownOptions = useMemo<DropdownOption[]>(() => {
		const options: DropdownOption[] = [];

		if (canBeSigned && !isAwaitingOurFinalSignature) {
			options.push({
				icon: "Pencil",
				iconPosition: "start",
				label: t("COMMON.SIGN"),
				value: "sign",
			});
		}

		if (isAwaitingOurFinalSignature) {
			options.push({
				icon: "DoubleArrowRight",
				iconPosition: "start",
				label: t("COMMON.SEND"),
				value: "sign",
			});
		}

		if (canBeDeleted) {
			options.push({
				icon: "Trash",
				iconClassName: "text-theme-danger-500",
				iconPosition: "start",
				label: t("COMMON.REMOVE"),
				value: "remove",
			});
		}

		return options;
	}, [canBeSigned]);

	return (
		<TableRow className="relative">
			<TableCell variant="start" isCompact={isCompact}>
				<div className="flex flex-col gap-1 font-semibold">
					<span className="text-sm">
						<TruncateMiddle
							className="text-theme-primary-600 cursor-pointer"
							text={transaction.id()}
							maxChars={14}
							onClick={() => onRowClick?.(transaction)} 
						/>
					</span>
					<span className="text-xs text-theme-secondary-700">
						<TimeAgo date={DateTime.fromUnix(transaction.timestamp().toUNIX()).toISOString()} />
					</span>
				</div>
			</TableCell>

			<TableCell
				className="hidden xl:table-cell"
				innerClassName="text-theme-secondary-text"
				isCompact={isCompact}
			>
				<span data-testid="TransactionRow__timestamp">{transaction.timestamp().format(timeFormat)}</span>
			</TableCell>

			<TableCell
				isCompact={isCompact}
			>
				<Label color="secondary" size="xs" noBorder className="p-1 rounded">
					{getLabel(transaction.type())}
				</Label>
			</TableCell>
			
			<TableCell innerClassName="space-x-2" isCompact={isCompact}>
				<Label color="danger-bg" size="xs" noBorder className="p-1 rounded">
					{t("COMMON.TO")}
				</Label>
				<span className="text-sm">
					<TruncateMiddle
						className="text-theme-primary-600 cursor-pointer"
						text={recipient || ""}
						maxChars={10}
						data-testId="TransactionRowRecipientLabel"
					/>
				</span>
			</TableCell>

			<TableCell isCompact={isCompact} innerClassName="justify-end">
				<div className="flex flex-col gap-1 items-end">
					<AmountLabel value={transaction.amount() + transaction.fee()} isNegative={true} ticker={wallet.currency()} isCompact />
					<span className="text-theme-secondary-700 text-xs font-semibold">{transaction.fee()}</span>
				</div>
			</TableCell>

			<TableCell isCompact={isCompact}>
				<div className="flex flex-row items-center">
					<SignButton
							isCompact={isCompact}
							canBeSigned={canBeSigned}
							isAwaitingFinalSignature={isAwaitingFinalSignature}
							isAwaitingOurFinalSignature={isAwaitingOurFinalSignature}
							onClick={() => onSign?.(transaction)}
						/>
					<Divider type="vertical" className="m-0 border-theme-secondary-300 dark:border-theme-secondary-800" />
					<Tooltip
						content={
							canBeDeleted
								? undefined
								: t("TRANSACTION.MULTISIGNATURE.PARTICIPANTS_CAN_REMOVE_PENDING_MUSIG")
						}
					>
						<div>
							<TableRemoveButton
								isCompact={isCompact}
								isDisabled={!canBeDeleted}
								onClick={handleRemove}
								className="p-0 m-0"
							/>
						</div>
					</Tooltip>
				</div>
			</TableCell>
		</TableRow>
	);
};
