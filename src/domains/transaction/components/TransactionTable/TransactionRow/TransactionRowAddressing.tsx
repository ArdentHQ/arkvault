import { Address } from "@/app/components/Address";
import { Label } from "@/app/components/Label";
import { useEnvironmentContext } from "@/app/contexts";
import { useWalletAlias } from "@/app/hooks";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";

const RowLabel = ({ isNegative }: { isNegative: boolean }) => {
	const { t } = useTranslation();

	return (
		<Label
			color={isNegative ? "danger-bg" : "success-bg"}
			size="xs"
			noBorder
			className="!flex w-10 items-center justify-center rounded py-[3px]"
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
	transaction: DTO.ExtendedConfirmedTransactionData;
	profile: Contracts.IProfile;
}) => {
	const isNegative = transaction.isSent();
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
		if (transaction?.isVote() || transaction?.isUnvote()) {
			setDelegates({
				unvotes: env.delegates().map(transaction.wallet(), transaction.unvotes()),
				votes: env.delegates().map(transaction.wallet(), transaction.votes()),
			});
		}
	}, [env, transaction]);

	if (transaction?.isMultiPayment()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__multipayment">
				<RowLabel isNegative={isNegative} />
				<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{t("COMMON.MULTIPLE")}{" "}
					<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
						({transaction.recipients().length})
					</span>
				</span>
			</div>
		);
	}

	if (transaction?.isVoteCombination() || transaction?.isVote() || transaction?.isUnvote()) {
		return (
			<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__vote">
				<RowLabel isNegative={isNegative} />
				<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{t("COMMON.CONTRACT")}{" "}
					<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
						(
						{delegates[
							transaction?.isVote() || transaction?.isVoteCombination() ? "votes" : "unvotes"
						][0]?.username()}
						)
					</span>
				</span>
			</div>
		);
	}

	return (
		<div className="flex flex-row gap-2" data-testid="TransactionRowAddressing__container">
			<RowLabel isNegative={isNegative} />
			<div className="w-50">
				<Address
					walletName={alias}
					address={transaction.sender()}
					truncateOnTable
					addressWrapperClass="w-20"
					addressClass={cn("pt-0.5", {
						"text-theme-primary-600": !alias,
						"text-theme-secondary-700 dark:text-theme-secondary-200": alias,
					})}
					size="sm"
				/>
			</div>
		</div>
	);
};
