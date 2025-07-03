import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { useActiveProfile, useValidation } from "@/app/hooks";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { Networks } from "@/app/lib/mainsail";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { getFeeType } from "@/domains/transaction/pages/SendTransfer/utils";
import { buildTransferData } from "@/domains/transaction/pages/SendTransfer/SendTransfer.helpers";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Amount } from "@/app/components/Amount";

interface ReviewStepProperties {
	wallet: Contracts.IReadWriteWallet;
	network: Networks.Network;
}

export const ReviewStep = ({ wallet, network }: ReviewStepProperties) => {
	const { t } = useTranslation();

	const { unregister, watch, register, getValues } = useFormContext();
	const { recipients } = watch();
	const profile = useActiveProfile();

	let amount = 0;

	for (const recipient of recipients) {
		amount += recipient.amount;
	}

	const ticker = wallet.currency();
	const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) as string;
	const { convert } = useExchangeRate({ exchangeTicker, profile, ticker });

	const { common: commonValidation } = useValidation();

	const walletBalance = wallet.balance();

	useEffect(() => {
		register("gasPrice", commonValidation.gasPrice(walletBalance, getValues, wallet.network()));
		register("gasLimit", commonValidation.gasLimit(walletBalance, getValues, wallet.network()));
	}, [commonValidation, register, walletBalance]);

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	const [feeTransactionData, setFeeTransactionData] = useState<Record<string, any> | undefined>();

	useEffect(() => {
		const updateFeeTransactionData = () => {
			const transferData = buildTransferData({
				recipients,
			});

			setFeeTransactionData(transferData);
		};

		void updateFeeTransactionData();
	}, [recipients]);

	const showFeeInput = useMemo(() => !network.chargesZeroFees(), [network]);

	const isTestnet = wallet.network().isTest();
	const convertedAmount = isTestnet ? 0 : convert(amount);

	return (
		<section data-testid="SendTransfer__review-step">
			<StepHeader
				titleIcon={
					<Icon
						dimensions={[24, 24]}
						name="DocumentView"
						data-testid="icon-DocumentView"
						className="text-theme-primary-600"
					/>
				}
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
			/>
			<div className="-mx-3 mt-4 space-y-3 sm:mx-0 sm:space-y-4">
				<TransactionAddresses
					senderAddress={wallet.address()}
					recipients={recipients}
					profile={profile}
					network={wallet.network()}
					labelClassName="w-14 sm:min-w-[85px] sm:pr-6"
				/>

				<div className="space-y-3 sm:space-y-2">
					<div className="mx-0">
						<DetailWrapper label={t("COMMON.TRANSACTION_SUMMARY")} className="rounded-xl">
							<div className="flex flex-col gap-3">
								<div
									className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
									data-testid="AmountSection"
								>
									<DetailTitle className="w-auto sm:min-w-[85px] sm:pr-6">
										{t("COMMON.AMOUNT")}
									</DetailTitle>

									<div className="flex flex-row items-center gap-2">
										<Amount ticker={ticker} value={amount} className="font-semibold" />
										{!isTestnet && !!convertedAmount && !!exchangeTicker && (
											<div className="text-theme-secondary-700 font-semibold">
												(~
												<Amount ticker={exchangeTicker} value={convertedAmount} />)
											</div>
										)}
									</div>
								</div>
							</div>
						</DetailWrapper>
					</div>
				</div>

				{showFeeInput && (
					<FormField name="fee" disableStateHints>
						<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
						{!!network && (
							<FeeField
								type={getFeeType(recipients?.length)}
								data={feeTransactionData}
								network={network}
								profile={profile}
							/>
						)}
					</FormField>
				)}
			</div>
		</section>
	);
};
