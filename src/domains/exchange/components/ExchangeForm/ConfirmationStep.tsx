import { Contracts } from "@/app/lib/profiles";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AmountLabel } from "@/app/components/Amount";
import { DetailLabelText, DetailPadded, DetailsCondensed, DetailWrapper } from "@/app/components/DetailWrapper";
import { TransactionId } from "@/domains/transaction/components/TransactionDetail/TransactionId";
import { ExtendedTransactionData } from "@/domains/transaction/hooks/use-transaction-total";
import { Address } from "@/app/components/Address";
import { FormDivider } from "./ExchangeForm.blocks";
interface ConfirmationStepProperties {
	exchangeTransaction?: Contracts.IExchangeTransaction;
	exchangeName?: string;
	profile: Contracts.IProfile;
}

const explorerUrl = (value: string, explorerMask: string) => explorerMask.replace("{}", value);

export const ConfirmationStep = ({ exchangeTransaction, profile, exchangeName }: ConfirmationStepProperties) => {
	const { t } = useTranslation();

	const { watch } = useFormContext();
	const { fromCurrency, toCurrency } = watch();

	if (!exchangeTransaction) {
		return <></>;
	}

	const exampleHashToDelete = "f5c35d081cc958f0999cf0f7a5e5e9f465f18c346640626555f1129f02f5ce60";

	const inputTransaction = exchangeTransaction.input();
	const inputTransactionData: Pick<ExtendedTransactionData, "explorerLink" | "hash" | "isConfirmed"> = {
		explorerLink: () =>
			explorerUrl(
				inputTransaction.hash ?? "f5c35d081cc958f0999cf0f7a5e5e9f465f18c346640626555f1129f02f5ce60",
				fromCurrency?.transactionExplorerMask ?? "https://blockchair.com/bitcoin/transaction/{}",
			),
		hash: () => inputTransaction.hash ?? exampleHashToDelete,
		isConfirmed: () => true,
	};

	const outputTransaction = exchangeTransaction.output();
	const outputTransactionData: Pick<ExtendedTransactionData, "explorerLink" | "hash" | "isConfirmed"> = {
		explorerLink: () =>
			explorerUrl(
				outputTransaction.hash ?? "f5c35d081cc958f0999cf0f7a5e5e9f465f18c346640626555f1129f02f5ce60",
				toCurrency?.transactionExplorerMask ?? "https://blockchair.com/bitcoin/transaction/{}",
			),
		hash: () => outputTransaction.hash ?? exampleHashToDelete,
		isConfirmed: () => true,
	};

	return (
		<div data-testid="ExchangeForm__confirmation-step" className="flex flex-col space-y-4 sm:space-y-6">
			<DetailsCondensed>
				<TransactionId
					transaction={inputTransactionData}
					isConfirmed={true}
					label={t("EXCHANGE.EXCHANGE_FORM.CURRENCY_TRANSACTION_ID", {
						currency: fromCurrency?.coin.toUpperCase(),
					})}
				/>

				<div className="mt-6 space-y-3 sm:space-y-4">
					<DetailPadded className="flex-1-mx-3 flex-1 sm:ml-0">
						<DetailWrapper label={t("COMMON.TRANSACTION_INFORMATION")}>
							<div className="space-y-3">
								<div className="space-y-3 sm:space-y-0">
									<div className="flex w-full justify-between gap-2 sm:justify-start">
										<DetailLabelText className="min-w-[127px] sm:min-w-[207px]">
											<span className="hidden sm:inline">
												{t("EXCHANGE.EXCHANGE_FORM.EXCHANGE_ADDRESS", {
													currency: fromCurrency?.coin.toUpperCase(),
													exchangeName,
												})}
											</span>

											<span className="sm:hidden">
												{t("EXCHANGE.EXCHANGE_FORM.CURRENCY_ADDRESS", {
													currency: fromCurrency?.coin.toUpperCase(),
												})}
											</span>
										</DetailLabelText>

										<Address
											truncateOnTable
											address={inputTransaction.address}
											showCopyButton
											walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
											wrapperClass="justify-end sm:justify-start"
											addressClass="text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4"
										/>
									</div>
								</div>

								<div className="space-y-3 sm:space-y-0">
									<div className="flex w-full justify-between gap-2 sm:justify-start">
										<DetailLabelText className="min-w-[127px] sm:min-w-[207px]">
											{t("COMMON.AMOUNT")}
										</DetailLabelText>

										<AmountLabel
											value={inputTransaction.amount}
											ticker={inputTransaction.ticker}
											isNegative
											hideSign={false}
											profile={profile}
										/>
									</div>
								</div>
							</div>
						</DetailWrapper>
					</DetailPadded>
				</div>

				<FormDivider className="sm:hidden" />
			</DetailsCondensed>

			<DetailsCondensed>
				<TransactionId
					transaction={outputTransactionData}
					isConfirmed={true}
					label={t("EXCHANGE.EXCHANGE_FORM.CURRENCY_TRANSACTION_ID", {
						currency: toCurrency?.coin.toUpperCase(),
					})}
				/>

				<div className="mt-6 space-y-3 sm:space-y-4">
					<DetailPadded className="flex-1-mx-3 flex-1 sm:ml-0">
						<DetailWrapper label={t("COMMON.TRANSACTION_INFORMATION")}>
							<div className="space-y-3">
								<div className="space-y-3 sm:space-y-0">
									<div className="flex w-full justify-between gap-2 sm:justify-start">
										<DetailLabelText className="min-w-[127px] sm:min-w-[207px]">
											<span className="hidden sm:inline">
												{t("EXCHANGE.EXCHANGE_FORM.YOUR_ADDRESS", {
													currency: toCurrency?.coin.toUpperCase(),
												})}
											</span>

											<span className="sm:hidden">
												{t("EXCHANGE.EXCHANGE_FORM.CURRENCY_ADDRESS", {
													currency: toCurrency?.coin.toUpperCase(),
												})}
											</span>
										</DetailLabelText>

										<Address
											truncateOnTable
											address={outputTransaction.address}
											showCopyButton
											walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
											wrapperClass="justify-end sm:justify-start"
											addressClass="text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4"
										/>
									</div>
								</div>

								<div className="space-y-3 sm:space-y-0">
									<div className="flex w-full justify-between gap-2 sm:justify-start">
										<DetailLabelText className="min-w-[127px] sm:min-w-[207px]">
											{t("COMMON.AMOUNT")}
										</DetailLabelText>

										<AmountLabel
											value={outputTransaction.amount}
											ticker={outputTransaction.ticker}
											isNegative={false}
											hideSign={false}
											profile={profile}
										/>
									</div>
								</div>
							</div>
						</DetailWrapper>
					</DetailPadded>
				</div>
			</DetailsCondensed>
		</div>
	);
};
