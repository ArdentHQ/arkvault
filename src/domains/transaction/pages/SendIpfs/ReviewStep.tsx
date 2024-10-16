import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { TransactionAddresses, TransactionType } from "@/domains/transaction/components/TransactionDetail";
import { DetailLabel } from "@/app/components/DetailWrapper";

export const ReviewStep = ({ wallet, transaction }: { wallet: Contracts.IReadWriteWallet, transaction: DTO.ExtendedSignedTransactionData }) => {
	const { t } = useTranslation();

	const { unregister, watch } = useFormContext();
	const { fee } = watch();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="SendIpfs__review-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_IPFS.SECOND_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_IPFS.SECOND_STEP.DESCRIPTION")}
				titleIcon={
					<Icon
						dimensions={[24, 24]}
						name="DocumentView"
						data-testid="icon-DocumentView"
						className="text-theme-primary-600"
					/>
				}
			/>

			<div className="mt-4 space-y-4 -mx-3 sm:mx-0">
				<TransactionAddresses
					labelClassName="min-w-24"
					profile={wallet.profile()}
					senderAddress={transaction.sender()}
					network={wallet.network()}
				/>

				<TransactionType transaction={transaction} labelClassName="min-w-32" />

				<div data-testid="DetailWrapper">
					<DetailLabel>{t("COMMON.TRANSACTION_SUMMARY")}</DetailLabel>
					<div className="mt-0 p-3 sm:mt-2 sm:p-0">
						<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
					</div>
				</div>
			</div>
		</section>
	);
};
