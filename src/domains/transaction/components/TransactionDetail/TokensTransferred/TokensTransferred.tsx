import { Contracts, DTO } from "@/app/lib/profiles";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import React, { ReactElement } from "react";

import { Amount } from "@/app/components/Amount";
import { TransactionAmountLabel } from "@/domains/transaction/components/TransactionTable/TransactionRow/TransactionAmount.blocks";
import { useTranslation } from "react-i18next";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { Address } from "@/app/components/Address";
import cn from "classnames";
import { useWalletAlias } from "@/app/hooks";
import { Skeleton } from "@/app/components/Skeleton";

interface Properties {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	labelClassName?: string;
	profile: Contracts.IProfile;
	allowHideBalance?: boolean;
	token: TokenDTO;
	isRefreshingTransaction?: boolean;
}
export const TokensTransferred = ({
	transaction,
	senderWallet,
	labelClassName,
	profile,
	allowHideBalance = false,
	isRefreshingTransaction,
}: Properties): ReactElement => {
	const { t } = useTranslation();

	const { getWalletAlias } = useWalletAlias();

	const { alias } = getWalletAlias({
		address: transaction.to(),
		network: senderWallet.network(),
		profile,
	});

	return (
		<DetailWrapper label={t("TRANSACTION.TOKENS_TRANSFERRED")}>
			<div className="space-y-3">
				<div data-testid="TokensTransferred__To" className="flex w-full justify-between gap-2 sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.TO")}</DetailLabelText>

					{!isRefreshingTransaction && (
						<Address
							truncateOnTable
							address={transaction.to()}
							walletName={alias}
							showCopyButton
							walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
							wrapperClass="justify-end sm:justify-start"
							addressClass={cn("text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4", {
								"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-200":
									!!alias,
							})}
						/>
					)}

					{isRefreshingTransaction && <Skeleton height={16} width={150} />}
				</div>

				<div
					data-testid="TokensTransferred__Amount"
					className="flex w-full justify-between gap-2 sm:justify-start"
				>
					<DetailLabelText className={labelClassName}>{t("COMMON.AMOUNT")}</DetailLabelText>

					{!isRefreshingTransaction && (
						<TransactionAmountLabel
							transaction={transaction}
							profile={profile}
							allowHideBalance={allowHideBalance}
						/>
					)}

					{isRefreshingTransaction && <Skeleton height={16} width={100} />}
				</div>

				<div className="flex w-full justify-between gap-2 sm:justify-start">
					<DetailLabelText className={labelClassName}>{t("COMMON.VALUE")}</DetailLabelText>
					<Amount
						ticker={senderWallet.exchangeCurrency()}
						value={0}
						className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
						allowHideBalance={allowHideBalance}
						profile={profile}
					/>
				</div>
			</div>
		</DetailWrapper>
	);
};
