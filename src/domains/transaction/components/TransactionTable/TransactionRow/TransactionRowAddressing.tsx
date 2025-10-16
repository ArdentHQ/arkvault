import { Address } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { useTheme, useWalletAlias } from "@/app/hooks";
import { Contracts } from "@/app/lib/profiles";
import { DTO } from "@/app/lib/mainsail";
import React, { useMemo, JSX } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { ColorType } from "@/app/components/Label/Label.styles";
import { Link } from "@/app/components/Link";
import { isContractDeployment, isContractTransaction } from "@/domains/transaction/utils";
import { useTransactionRecipients } from "@/domains/transaction/hooks/use-transaction-recipients";
import { Tooltip } from "@/app/components/Tooltip";
import { Icon } from "@/app/components/Icon";
import { Clipboard } from "@/app/components/Clipboard";

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
			className="flex! h-[21px] w-12 min-w-12 items-center justify-center rounded px-1 py-[3px] dark:border"
			data-testid="TransactionRowAddressing__label"
		>
			{title[direction]}
		</Label>
	);
};

const FormattedAddress = ({ alias, address }: { alias?: string; address: string }): JSX.Element => {
	const { isDarkMode } = useTheme();
	const { t } = useTranslation();

	return (
		<div className="flex min-w-36 grow items-center justify-between space-x-4">
			<Tooltip content={address}>
				<div className="grow" data-testid="TransactionRowAddressing__address-container">
					<Address
						showTooltip={false}
						walletName={alias}
						address={alias ? "" : address}
						truncateOnTable
						addressClass={cn({
							"text-theme-secondary-700 dark:text-theme-secondary-500": alias,
							"text-theme-text": !alias,
						})}
						size="sm"
					/>
				</div>
			</Tooltip>

			<Clipboard variant="icon" data={address} tooltip={t("COMMON.COPY_ADDRESS")} tooltipDarkTheme={isDarkMode}>
				<Icon
					name="Copy"
					className="text-theme-secondary-700 dark:text-theme-secondary-600 hover:text-theme-primary-700 dim:text-theme-dim-200 dim-hover:text-white dark:hover:text-white"
				/>
			</Clipboard>
		</div>
	);
};

const ContractAddressing = ({
	transaction,
	direction,
	t,
}: {
	transaction: DTO.RawTransactionData;
	direction: Direction;
	t: any;
}) => {
	const { isDarkMode } = useTheme();
	const address = isContractDeployment(transaction)
		? transaction.data().data.receipt.deployedContractAddress
		: transaction.to();

	return (
		<div className="flex w-full flex-row gap-2" data-testid="TransactionRowAddressing__vote">
			<TransactionRowLabel direction={direction} />

			<div className="flex w-full items-center justify-between space-x-4">
				<Link
					to={transaction.wallet().link().wallet(address)}
					isExternal
					showExternalIcon={false}
					className="text-sm font-semibold whitespace-nowrap"
				>
					{t("COMMON.CONTRACT")}
				</Link>

				<Clipboard
					variant="icon"
					data={address}
					tooltip={t("COMMON.COPY_ADDRESS")}
					tooltipDarkTheme={isDarkMode}
				>
					<Icon
						name="Copy"
						className="text-theme-secondary-700 dark:text-theme-secondary-600 hover:text-theme-primary-700 dark:hover:text-white"
					/>
				</Clipboard>
			</div>
		</div>
	);
};

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
			<span className="text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 flex flex-1 gap-2 text-sm font-semibold">
				{(direction === "return" || direction === "sent") && (
					<>
						{t("COMMON.MULTIPLE")}{" "}
						<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200">
							({transaction.recipients().length})
						</span>
					</>
				)}
				{direction === "received" && <FormattedAddress address={transaction.from()} alias={alias} />}
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
	const { isDarkMode } = useTheme();

	const isMusigTransfer = false;

	const isNegative = [isMusigTransfer, transaction.isSent()].some(Boolean);
	const isContract = isContractTransaction(transaction);

	let direction: Direction = isNegative ? "sent" : "received";
	if (transaction.isReturn() || (isMusigTransfer && transaction.from() === transaction.to())) {
		direction = "return";
	}

	const { recipients } = useTransactionRecipients({ profile, transaction });

	const network = transaction.wallet().network();
	const recipientAddress = transaction.to();
	const senderAddress = transaction.from();

	const recipientAlias = useMemo(() => {
		const found = recipients.find((r) => r.address === recipientAddress);
		if (found && found.alias) {
			return found.alias;
		}
		const result = getWalletAlias({
			address: recipientAddress,
			network,
			profile,
		});
		return result.alias;
	}, [recipients, recipientAddress, network, profile, getWalletAlias]);

	const senderAlias = useMemo(() => {
		const result = getWalletAlias({
			address: senderAddress,
			network,
			profile,
		});
		return result.alias;
	}, [senderAddress, network, profile, getWalletAlias]);

	const alias = useMemo(() => {
		if (isAdvanced) {
			return variant === "sender" ? senderAlias : recipientAlias;
		}
		return isNegative ? recipientAlias : senderAlias;
	}, [isAdvanced, variant, isNegative, senderAlias, recipientAlias]);

	if (isAdvanced && variant === "sender") {
		return (
			<div
				className="flex w-full flex-row gap-2"
				data-testid="TransactionRowAddressing__container_advanced_sender"
			>
				<TransactionRowLabel direction="received" style="return" />

				<FormattedAddress address={senderAddress} alias={senderAlias} />
			</div>
		);
	}

	if (isAdvanced && variant === "recipient" && !transaction.isMultiPayment()) {
		if (isContract || isContractDeployment(transaction)) {
			return (
				<div
					className="flex w-full flex-row gap-2"
					data-testid="TransactionRowAddressing__vote_advanced_recipient"
				>
					<TransactionRowLabel direction="sent" style="return" />
					<div className="flex w-full items-center justify-between space-x-4">
						<Link
							to={transaction.wallet().link().wallet(recipientAddress)}
							isExternal
							showExternalIcon={false}
							className="text-sm font-semibold whitespace-nowrap"
						>
							{t("COMMON.CONTRACT")}
						</Link>

						<Clipboard
							variant="icon"
							data={recipientAddress}
							tooltip={t("COMMON.COPY_ADDRESS")}
							tooltipDarkTheme={isDarkMode}
						>
							<Icon
								name="Copy"
								className="text-theme-secondary-700 dark:text-theme-secondary-600 hover:text-theme-secondary-700 dim:text-theme-dim-200 dim-hover:text-white dark:hover:text-white"
							/>
						</Clipboard>
					</div>
				</div>
			);
		}

		return (
			<div
				className="flex w-full flex-row gap-2"
				data-testid="TransactionRowAddressing__container_advanced_recipient"
			>
				<TransactionRowLabel direction="sent" style="return" />
				<FormattedAddress address={recipientAddress} alias={recipientAlias} />
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

	const address = isNegative ? recipientAddress : senderAddress;
	return (
		<div className="flex w-full flex-row gap-2" data-testid="TransactionRowAddressing__container">
			<TransactionRowLabel direction={direction} />
			<FormattedAddress address={address} alias={alias} />
		</div>
	);
};
