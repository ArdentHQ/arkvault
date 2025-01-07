import React from "react";
import { useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { DTO } from "@ardenthq/sdk-profiles";
import { MusigGeneratedAddress } from "@/domains/transaction/components/TransactionDetail/MusigGeneratedAddress/MusigGeneratedAddress";
import { transactionPublicKeys } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";

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
			<DetailWrapper label={t("COMMON.ACTION")}>
				<div className="space-y-3 sm:space-y-0">
					<div className="flex w-full justify-between sm:justify-start">
						<DetailLabelText>{t("COMMON.METHOD")}</DetailLabelText>
						<Label color="neutral" size="xs">
							{getLabel(transaction.type())}
						</Label>
					</div>

					{transaction.isValidatorRegistration() && (
						<>
							<DetailDivider />

							<div className="flex w-full justify-between sm:justify-start">
								<DetailLabelText>{t("COMMON.PUBLIC_KEY")}</DetailLabelText>

								<div className="no-ligatures min-w-0 truncate font-semibold leading-5">
									{transaction.validatorPublicKey()}
								</div>
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
										<div className="max-sm:text-sm font-semibold leading-5">
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
