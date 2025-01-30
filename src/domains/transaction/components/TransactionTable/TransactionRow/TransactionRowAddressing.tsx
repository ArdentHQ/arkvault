import { Address } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { useWalletAlias } from "@/app/hooks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { DTO } from "@ardenthq/sdk";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { ColorType } from "@/app/components/Label/Label.styles";
import { Link } from "@/app/components/Link";
import { isContractDeployment, isContractTransaction } from "@/domains/transaction/utils";

type Direction = "sent" | "received" | "return";
export const TransactionRowLabel = ({ direction, style }: { direction: Direction; style?: Direction }) => {
	const { t } = useTranslation();

	const color: Record<typeof direction, ColorType> = {
		received: "success-bg",
		return: "secondary",
		sent: "danger-bg",
	};

	const title: Record<typeof direction, string> = {
		received: t("COMMON.FROM"),
		return: t("COMMON.RETURN"),
		sent: t("COMMON.TO"),
	};

	return (
		<Label
			color={color[style || direction]}
			size="xs"
			noBorder
			className="!flex h-[21px] w-12 items-center justify-center rounded px-1 py-[3px] dark:border"
			data-testid="TransactionRowAddressing__label"
		>
			{title[direction]}
		</Label>
	);
};

const FormattedAddress = ({ alias, address }: { alias?: string; address: string }): JSX.Element => (
	<div
		className={cn({
			"w-40 sm:w-40 md:w-32": alias,
			"w-40 xs:w-50 sm:w-30": !alias,
		})}
		data-testid="TransactionRowAddressing__address-container"
	>
		<Address
			walletName={alias}
			address={address}
			truncateOnTable
			addressClass={cn({
				"text-theme-secondary-700 dark:text-theme-secondary-500": alias,
				"text-theme-text": !alias,
			})}
			size="sm"
		/>
	</div>
);

const ContractAddressing = ({
	transaction,
	direction,
	t,
}: {
	transaction: DTO.RawTransactionData;
	direction: Direction;
	t: any;
}) => (
	<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__vote">
		<TransactionRowLabel direction={direction} />
		<Link
			to={transaction.wallet().coin().link().wallet(transaction.recipient())}
			isExternal
			showExternalIcon={false}
			className="text-sm font-semibold"
		>
			{t("COMMON.CONTRACT")}
		</Link>
	</div>
);

const MultiPaymentAddressing = ({
	direction,
	transaction,
	isAdvanced,
	variant,
	alias,
}: {
	direction: Direction;
	transaction: DTO.RawTransactionData;
	isAdvanced?: boolean;
	variant?: string;
	alias?: string;
}) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__multipayment">
			<TransactionRowLabel
				direction={direction}
				style={isAdvanced && variant === "recipient" ? "return" : direction}
			/>
			<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
				{(direction === "return" || direction === "sent") && (
					<>
						{t("COMMON.MULTIPLE")}{" "}
						<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
							({transaction.recipients().length})
						</span>
					</>
				)}
				{direction === "received" && <FormattedAddress address={transaction.sender()} alias={alias} />}
			</span>
		</div>
	);
};

export const TransactionRowAddressing = ({
	transaction,
	profile,
	variant = "sender",
	isAdvanced,
}: {
	transaction: DTO.RawTransactionData;
	profile: Contracts.IProfile;
	variant?: "sender" | "recipient";
	isAdvanced?: boolean;
}): JSX.Element => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();

	const isMusigTransfer = [
		!!transaction.usesMultiSignature?.(),
		!transaction.isConfirmed(),
		!transaction.isMultiSignatureRegistration(),
	].every(Boolean);

	const isNegative = [isMusigTransfer, transaction.isSent()].some(Boolean);
	const isContract = isContractTransaction(transaction);

	let direction: Direction = isNegative ? "sent" : "received";
	if (transaction.isReturn() || (isMusigTransfer && transaction.sender() === transaction.recipient())) {
		direction = "return";
	}

	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: transaction.recipient(),
				network: transaction.wallet().network(),
				profile,
			}),
		[profile, getWalletAlias, transaction],
	);

	const { alias: senderAlias } = useMemo(
		() =>
			isAdvanced && variant === "sender"
				? getWalletAlias({
						address: transaction.sender(),
						network: transaction.wallet().network(),
						profile,
					})
				: { alias: undefined },
		[profile, getWalletAlias, transaction, isAdvanced, variant],
	);

	if (isAdvanced && variant === "sender") {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__container_advanced_sender">
				<TransactionRowLabel direction="received" style="return" />
				<FormattedAddress address={transaction.sender()} alias={senderAlias} />
			</div>
		);
	}

	if (isAdvanced && variant === "recipient" && !transaction.isMultiPayment()) {
		if (isContract || isContractDeployment(transaction)) {
			return (
				<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__vote_advanced_recipient">
					<TransactionRowLabel direction="sent" style="return" />
					<Link
						to={transaction.wallet().coin().link().wallet(transaction.recipient())}
						isExternal
						showExternalIcon={false}
						className="text-sm font-semibold"
					>
						{t("COMMON.CONTRACT")}
					</Link>
				</div>
			);
		}

		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__container_advanced_recipient">
				<TransactionRowLabel direction="sent" style="return" />
				<FormattedAddress address={transaction.recipient()} alias={alias} />
			</div>
		);
	}

	if (transaction.isMultiPayment()) {
		return (
			<MultiPaymentAddressing
				direction={direction}
				transaction={transaction}
				isAdvanced={isAdvanced}
				variant={variant}
				alias={alias}
			/>
		);
	}

	if (isContract || isContractDeployment(transaction)) {
		return <ContractAddressing transaction={transaction} direction={direction} t={t} />;
	}

	return (
		<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__container">
			<TransactionRowLabel direction={direction} />
			<FormattedAddress address={isNegative ? transaction.recipient() : transaction.sender()} alias={alias} />
		</div>
	);
};
