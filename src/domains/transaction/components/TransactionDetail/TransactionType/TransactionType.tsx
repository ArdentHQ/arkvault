import React from "react";
import { useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailDivider, DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { DTO } from "@/app/lib/profiles";
import cn from "classnames";

const validatorPublickey = (transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData) => {
	try {
		return transaction.validatorPublicKey();
	} catch {
		// Exception is thrown if public key is invalid. Return zeros to match explorer.
		return "0x0000000000000000000000000000000000000000000000000000000000000000";
	}
};

export const TransactionType = ({
	transaction,
}: {
	transaction: DTO.ExtendedSignedTransactionData | DTO.ExtendedConfirmedTransactionData;
}) => {
	const { t } = useTranslation();

	const { getLabel } = useTransactionTypes();

	const isValidatorRegistrationOrResignation =
		transaction.isValidatorRegistration() || transaction.isValidatorResignation();

	const labelClassName = cn({
		"min-w-24": !isValidatorRegistrationOrResignation,
		"min-w-[138px]": isValidatorRegistrationOrResignation,
	});

	return (
		<div data-testid="TransactionType">
			<DetailWrapper label={t("COMMON.ACTION")}>
				<div className="space-y-3 sm:space-y-0">
					<div className="flex w-full justify-between sm:justify-start">
						<DetailLabelText className={labelClassName}>{t("COMMON.METHOD")}</DetailLabelText>
						<Label color="neutral" size="xs">
							{getLabel(transaction.type())}
						</Label>
					</div>

					{transaction.isUsernameRegistration() && (
						<>
							<DetailDivider />

							<div className="flex w-full justify-between sm:justify-start">
								<DetailLabelText>{t("COMMON.USERNAME")}</DetailLabelText>

								<div className="no-ligatures min-w-0 truncate leading-5 font-semibold">
									{transaction.username()}
								</div>
							</div>
						</>
					)}

					{(transaction.isValidatorRegistration() || transaction.isUpdateValidator()) && (
						<>
							<DetailDivider />

							<div className="flex w-full justify-between sm:justify-start">
								<DetailLabelText className={labelClassName}>{t("COMMON.PUBLIC_KEY")}</DetailLabelText>

								<div className="no-ligatures min-w-0 truncate leading-5 font-semibold">
									{validatorPublickey(transaction)}
								</div>
							</div>
						</>
					)}
				</div>
			</DetailWrapper>
		</div>
	);
};
