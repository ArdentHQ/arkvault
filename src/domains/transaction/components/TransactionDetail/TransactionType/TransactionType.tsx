import React from "react";
import { useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { DTO } from "@ardenthq/sdk-profiles";
import { MusigGeneratedAddress } from "@/domains/transaction/components/TransactionDetail/MusigGeneratedAddress/MusigGeneratedAddress";
import { transactionPublicKeys } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";
import { Address } from "@/app/components/Address";

export const TransactionType = ({
	transaction,
}: {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}) => {
	const { t } = useTranslation();

	const { getLabel } = useTransactionTypes();

	const { min, publicKeys } = transactionPublicKeys(transaction);

	return (
		<div data-testid="TransactionType">
			<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
				<div className="space-y-3 sm:space-y-0">
					<div className="flex w-full justify-between sm:justify-start">
						<DetailLabelText>{t("COMMON.CATEGORY")}</DetailLabelText>
						<Label color="neutral" size="xs">
							{getLabel(transaction.type())}
						</Label>
					</div>

					{transaction.isValidatorRegistration() && (
						<>
							<DetailDivider />

							<div className="flex w-full justify-between sm:justify-start">
								<DetailLabelText>{t("COMMON.PUBLIC_KEY")}</DetailLabelText>
								<Address
									truncateOnTable
									address={transaction.validatorPublicKey()}
									wrapperClass="justify-end sm:justify-start"
									addressClass="text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4"
								/>
							</div>
						</>
						)}

					{transaction.isMultiSignatureRegistration() && (
						<>
							{transaction.wallet?.() && (
								<>
									<DetailDivider />

									<div className="flex w-full justify-between sm:justify-start">
										<DetailLabelText>{t("COMMON.ADDRESS")}</DetailLabelText>
										<div className="font-semibold leading-5 max-sm:text-sm">
											<MusigGeneratedAddress
												publicKeys={publicKeys}
												min={min}
												wallet={transaction.wallet()}
											/>
										</div>
									</div>
								</>
							)}

							<DetailDivider />

							<div className="flex w-full items-center justify-between sm:justify-start">
								<DetailLabelText>{t("TRANSACTION.SIGNATURES")}</DetailLabelText>
								<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
									{min} {t("TRANSACTION.MULTISIGNATURE.OUT_OF_LENGTH", { length: publicKeys.length })}
								</div>
							</div>
						</>
					)}
				</div>
			</DetailWrapper>
		</div>
	);
};
