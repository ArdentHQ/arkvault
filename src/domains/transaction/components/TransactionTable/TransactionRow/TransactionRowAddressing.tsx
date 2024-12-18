import { Address } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { useEnvironmentContext } from "@/app/contexts";
import { useWalletAlias } from "@/app/hooks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { DTO } from "@ardenthq/sdk";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { ColorType } from "@/app/components/Label/Label.styles";

type Direction = "sent" | "received" | "return";
export const TransactionRowLabel = ({ direction }: { direction: Direction }) => {
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
			color={color[direction]}
			size="xs"
			noBorder
			className="!flex h-[21px] w-12 items-center justify-center rounded px-1 py-[3px] dark:border"
			data-testid="TransactionRowAddressing__label"
		>
			{title[direction]}
		</Label>
	);
};

export const TransactionRowAddressing = ({
	transaction,
	profile,
}: {
	transaction: DTO.RawTransactionData;
	profile: Contracts.IProfile;
	// eslint-disable-next-line sonarjs/cognitive-complexity
}): JSX.Element => {
	const isMusigTransfer = [
		!!transaction.usesMultiSignature?.(),
		!transaction.isConfirmed(),
		!transaction.isMultiSignatureRegistration(),
	].every(Boolean);

	const isNegative = [isMusigTransfer, transaction.isSent()].some(Boolean);

	let direction: Direction = isNegative ? "sent" : "received";

	const isReturn = transaction.isReturn() || (isMusigTransfer && transaction.sender() === transaction.recipient());

	if (isReturn) {
		direction = "return";
	}

	const { env } = useEnvironmentContext();
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();
	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: transaction.sender(),
				network: transaction.wallet().network(),
				profile,
			}),
		[profile, getWalletAlias, transaction],
	);

	const [delegates, setDelegates] = useState<{
		votes: Contracts.IReadOnlyWallet[];
		unvotes: Contracts.IReadOnlyWallet[];
	}>({
		unvotes: [],
		votes: [],
	});

	useEffect(() => {
		if (transaction.isVote() || transaction.isUnvote()) {
			setDelegates({
				unvotes: env.delegates().map(transaction.wallet(), transaction.unvotes()),
				votes: env.delegates().map(transaction.wallet(), transaction.votes()),
			});
		}
	}, [env, transaction]);

	if (transaction.isMultiPayment()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__multipayment">
				<TransactionRowLabel direction={direction} />
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
	}

	if (transaction.isVoteCombination() || transaction.isVote() || transaction.isUnvote()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__vote">
				<TransactionRowLabel direction={direction} />
				<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{t("COMMON.CONTRACT")}{" "}
					<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
						(
						{delegates[
							transaction.isVote() || transaction.isVoteCombination() ? "votes" : "unvotes"
						][0]?.username()}
						)
					</span>
				</span>
			</div>
		);
	}

	if (transaction.isMultiSignatureRegistration() || transaction.isIpfs()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__musig_registration">
				<TransactionRowLabel direction={direction} />
				<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{t("COMMON.CONTRACT")}
				</span>
			</div>
		);
	}

	if (transaction.isDelegateRegistration()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__delegate_registration">
				<TransactionRowLabel direction={direction} />
				<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{t("COMMON.CONTRACT")}{" "}
					<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
						({transaction.username()})
					</span>
				</span>
			</div>
		);
	}

	if (transaction.isDelegateResignation()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__delegate_resignation">
				<TransactionRowLabel direction={direction} />
				<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{t("COMMON.CONTRACT")}{" "}
					<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
						({transaction.wallet().username()})
					</span>
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__container">
			<TransactionRowLabel direction={direction} />
			<FormattedAddress address={isNegative ? transaction.recipient() : transaction.sender()} alias={alias} />
		</div>
	);
};

const FormattedAddress = ({ alias, address }: { alias?: string; address: string }): JSX.Element => (
	<div
		className={cn({
			"w-40 sm:w-40 md:w-32 lg:w-50": alias,
			"w-50 sm:w-30": !alias,
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
