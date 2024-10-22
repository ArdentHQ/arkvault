import { Address } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { useEnvironmentContext } from "@/app/contexts";
import { useWalletAlias } from "@/app/hooks";
import { Contracts } from "@ardenthq/sdk-profiles";
import { DTO } from "@ardenthq/sdk";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { extractVotingData } from "@/domains/transaction/components/VoteTransactionType/helpers";

export const TransactionRowLabel = ({ isNegative }: { isNegative: boolean }) => {
	const { t } = useTranslation();

	return (
		<Label
			color={isNegative ? "danger-bg" : "success-bg"}
			size="xs"
			noBorder
			className="!flex h-[21px] w-10 items-center justify-center rounded py-[3px]"
			data-testid="TransactionRowAddressing__label"
		>
			{isNegative ? t("COMMON.TO") : t("COMMON.FROM")}
		</Label>
	);
};

export const TransactionRowAddressing = ({
	transaction,
	profile,
}: {
	transaction: DTO.RawTransactionData;
	profile: Contracts.IProfile;
}) => {
	const isMusigTransfer = [
		!!transaction.usesMultiSignature?.(),
		!transaction.isConfirmed(),
		!transaction.isMultiSignatureRegistration(),
	].every(Boolean);
	const isNegative = [isMusigTransfer, transaction.isSent()].some(Boolean);

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
			const { votes, unvotes } = extractVotingData({ transaction });

			setDelegates({
				unvotes: env.delegates().map(transaction.wallet(), unvotes),
				votes: env.delegates().map(transaction.wallet(), votes),
			});
		}
	}, [env, transaction]);

	if (transaction.isMultiPayment()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__multipayment">
				<TransactionRowLabel isNegative={isNegative} />
				<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{t("COMMON.MULTIPLE")}{" "}
					<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
						({transaction.recipients().length})
					</span>
				</span>
			</div>
		);
	}

	if (transaction.isVoteCombination() || transaction.isVote() || transaction.isUnvote()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__vote">
				<TransactionRowLabel isNegative={isNegative} />
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

	if (transaction.isMultiSignatureRegistration()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__musig_registration">
				<TransactionRowLabel isNegative />
				<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{t("COMMON.CONTRACT")}
				</span>
			</div>
		);
	}

	if (transaction.isDelegateRegistration()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__delegate_registration">
				<TransactionRowLabel isNegative={isNegative} />
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
				<TransactionRowLabel isNegative={isNegative} />
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
			<TransactionRowLabel isNegative={isNegative} />
			<div
				className={cn({
					"w-50 sm:w-30": !alias,
					"w-50 sm:w-40 lg:w-50": alias,
				})}
				data-testid="TransactionRowAddressing__address-container"
			>
				<Address
					walletName={alias}
					address={isNegative ? transaction.recipient() : transaction.sender()}
					truncateOnTable
					addressClass={cn({
						"text-theme-secondary-700 dark:text-theme-secondary-500": alias,
						"text-theme-text": !alias,
					})}
					size="sm"
				/>
			</div>
		</div>
	);
};
