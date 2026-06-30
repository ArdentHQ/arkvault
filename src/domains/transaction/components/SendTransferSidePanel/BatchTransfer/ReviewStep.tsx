import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { useActiveProfile } from "@/app/hooks";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Amount } from "@/app/components/Amount";
import { ExchangeCurrencyAmount } from "@/domains/transaction/components/SendTransferSidePanel/SendTransferSidepanel.blocks";
import { TransactionSteps } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTranfer.blocks";
import { useBatchTransferDetails } from "@/domains/transaction/hooks/use-batch-transfer-details";

interface ReviewStepProperties {
	wallet: Contracts.IReadWriteWallet;
	isLoading: boolean;
	requiresContractApproval: boolean;
}

export const ReviewStep = ({ wallet, isLoading, requiresContractApproval }: ReviewStepProperties) => {
	const { t } = useTranslation();

	const { unregister, getValues } = useFormContext();
	const { recipients, tokenContractAddress } = getValues();

	const profile = useActiveProfile();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	const { amount, convertedAmount, walletToken, exchangeTicker } = useBatchTransferDetails({
		profile,
		recipients,
		tokenContractAddress,
		wallet,
	});

	const approvalStatus = () => {
		if (isLoading) {
			return "loading";
		}

		return requiresContractApproval ? "awaiting" : "approved";
	};

	return (
		<section data-testid="BatchTransfer__review-step">
			<div className="-mx-3 mt-4 space-y-3 sm:mx-0 sm:space-y-4">
				<TransactionAddresses
					senderAddress={wallet.address()}
					recipients={recipients}
					profile={profile}
					network={wallet.network()}
					labelClassName="w-14 sm:min-w-[168px] sm:pr-6"
					isMultiPayment
					ticker={walletToken.token().displaySymbol()}
				/>

				<div className="space-y-3 sm:space-y-4">
					<div className="mx-0">
						<DetailWrapper label={t("COMMON.TRANSACTION_SUMMARY")} className="rounded-xl">
							<div className="flex flex-col gap-3">
								<div
									className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0"
									data-testid="AmountSection"
								>
									<DetailTitle className="w-auto sm:min-w-44 sm:pr-6">
										{t("COMMON.AMOUNT")}
									</DetailTitle>

									<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
										<Amount
											ticker={walletToken.token().displaySymbol()}
											value={amount}
											decimals={walletToken.token().decimals()}
											className="whitespace-normal break-all text-sm font-semibold md:text-base"
										/>
										<ExchangeCurrencyAmount
											isTestnet={wallet.network().isTest()}
											convertedAmount={convertedAmount}
											exchangeTicker={exchangeTicker}
										/>
									</div>
								</div>
							</div>
						</DetailWrapper>
					</div>

					<div className="mx-0">
						<TransactionSteps approvalStatus={approvalStatus()} transferStatus="awaiting" />
					</div>
				</div>
			</div>
		</section>
	);
};
