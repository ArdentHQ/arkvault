import { Contracts, DTO } from "@payvo/sdk-profiles";
import cn from "classnames";
import React, { MouseEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { BaseTransactionRowAmount } from "./TransactionRowAmount";
import { BaseTransactionRowMode } from "./TransactionRowMode";
import { BaseTransactionRowRecipientLabel } from "./TransactionRowRecipientLabel";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";
import { TableRemoveButton } from "@/app/components/TableRemoveButton";
import { Tooltip } from "@/app/components/Tooltip";
import { useTimeFormat } from "@/app/hooks/use-time-format";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";

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
		return <></>;
	}

	const ButtonContent = () => {
		if (isAwaitingFinalSignature || isAwaitingOurFinalSignature) {
			return (
				<>
					<span>{t("COMMON.SEND")}</span>
					<Icon name="DoubleArrowRight" />
				</>
			);
		}

		return (
			<>
				<Icon name="Pencil" />
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
				className={`text-theme-primary-600 hover:text-theme-primary-700 ${className}`}
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
	const recipient = transaction.get<string>("recipientId");
	const { canBeSigned, isAwaitingFinalSignature, isAwaitingOurFinalSignature, status } = useMultiSignatureStatus({
		transaction,
		wallet,
	});

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

		options.push({
			icon: "Trash",
			iconClassName: "text-theme-danger-500",
			iconPosition: "start",
			label: t("COMMON.REMOVE"),
			value: "remove",
		});

		return options;
	}, [canBeSigned]);

	const handleDropdownSelection = ({ value }) => {
		if (value === "remove") {
			handleRemove();
		} else {
			onSign?.(transaction);
		}
	};

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
				<span data-testid="TransactionRow__timestamp">{transaction.timestamp().format(timeFormat)}</span>
			</TableCell>

			<TableCell innerClassName="space-x-4" isCompact={isCompact}>
				<BaseTransactionRowMode
					isSent={true}
					type={transaction.type()}
					address={recipient}
					isCompact={isCompact}
				/>

				<BaseTransactionRowRecipientLabel type={transaction.type()} recipient={recipient} />
			</TableCell>

			<TableCell className="w-16" innerClassName="justify-center truncate" isCompact={isCompact}>
				<Tooltip content={status.label}>
					<span className={`p-1 ${status.className}`}>
						<Icon name={status.icon} size="lg" />
					</span>
				</Tooltip>
			</TableCell>

			<TableCell innerClassName="justify-end" isCompact={isCompact}>
				<BaseTransactionRowAmount
					isCompact={isCompact}
					isSent={true}
					total={transaction.amount() + transaction.fee()}
					wallet={wallet}
				/>
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end space-x-2" isCompact={isCompact}>
				<div className="hidden space-x-3 xl:flex">
					<SignButton
						isCompact={isCompact}
						canBeSigned={canBeSigned}
						isAwaitingFinalSignature={isAwaitingFinalSignature}
						isAwaitingOurFinalSignature={isAwaitingOurFinalSignature}
						onClick={() => onSign?.(transaction)}
					/>

					<TableRemoveButton isCompact={isCompact} onClick={handleRemove} />
				</div>
				<div className="xl:hidden">
					<Dropdown
						data-testid="SignedTransactionRow--dropdown"
						toggleContent={
							<Button
								variant={isCompact ? "transparent" : "secondary"}
								size="icon"
								className={cn("px-2", {
									"-mr-1.5 text-theme-primary-300 hover:text-theme-primary-600": isCompact,
									"flex-1 bg-theme-primary-600 text-white hover:bg-theme-primary-700": !isCompact,
								})}
							>
								<Icon name="EllipsisVertical" size="lg" />
							</Button>
						}
						options={dropdownOptions}
						onSelect={handleDropdownSelection}
					/>
				</div>
			</TableCell>
		</TableRow>
	);
};
