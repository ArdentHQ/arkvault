import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { DetailLabelText, DetailWrapper } from "@/app/components/DetailWrapper";
import { Label } from "@/app/components/Label";
import { DTO } from "@/app/lib/profiles";
import cn from "classnames";
import { TruncateEnd } from "@/app/components/TruncateEnd";
import { Divider } from "@/app/components/Divider";
import { Button } from "@/app/components/Button";

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

	const [showFullBytecode, setShowFullByteCode] = useState(false);

	const { getLabel } = useTransactionTypes();

	const isValidatorRegistrationOrResignation =
		transaction.isValidatorRegistration() || transaction.isValidatorResignation();

	const labelClassName = cn({
		"min-w-24": !isValidatorRegistrationOrResignation,
		"min-w-[138px]": isValidatorRegistrationOrResignation,
	});

	let bytecode: string|undefined;

	if(transaction.type().startsWith("0x")) {
		bytecode = transaction.isConfirmed() ? transaction.data().data.data : transaction.data().data().data;
	}

	return (
		<div data-testid="TransactionType">
			<DetailWrapper label={t("COMMON.ACTION")}>
				<div className="space-y-3">
					<div className="flex w-full justify-between sm:justify-start">
						<DetailLabelText className={labelClassName}>{t("COMMON.METHOD")}</DetailLabelText>
						<Label color="neutral" size="xs">
							{getLabel(transaction.type())}
						</Label>
					</div>

					{transaction.isUsernameRegistration() && (
						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText>{t("COMMON.USERNAME")}</DetailLabelText>

							<div className="no-ligatures min-w-0 truncate leading-5 font-semibold">
								{transaction.username()}
							</div>
						</div>
					)}

					{bytecode && (
						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText className="min-w-auto sm:min-w-24">{t("COMMON.BYTECODE")}</DetailLabelText>

							<div className="flex items-center">
								<div className="min-w-0 no-ligatures text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 truncate text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
									<TruncateEnd text={bytecode} maxChars={9} showTooltip={false} />
								</div>
								<div className="h-5 leading-[17px] sm:leading-5">
									<Divider type="vertical" size="md" />
								</div>

								<Button
									onClick={() => setShowFullByteCode(!showFullBytecode)}
									variant="transparent"
									data-testid="ContractDeploymentForm--ShowFullByteCode"
									className="text-theme-navy-600 decoration-theme-navy-600 p-0 text-sm leading-[17px] underline decoration-dashed decoration-1 underline-offset-4 sm:text-base sm:leading-5"
								>
									{showFullBytecode ? t("COMMON.HIDE") : t("TRANSACTION.VIEW_FULL")}
								</Button>
							</div>
						</div>

					)}

					{(transaction.isValidatorRegistration() || transaction.isUpdateValidator()) && (
						<div className="flex w-full justify-between sm:justify-start">
							<DetailLabelText className={labelClassName}>{t("COMMON.PUBLIC_KEY")}</DetailLabelText>

							<div className="no-ligatures min-w-0 truncate leading-5 font-semibold">
								{validatorPublickey(transaction)}
							</div>
						</div>
					)}
				</div>
				<div
					className={cn(
						"border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 max-h-0 overflow-y-scroll border-t text-sm leading-5 opacity-0 transition-all sm:text-base sm:leading-7",
						{
							"mt-3 -mb-3 max-h-64 pt-3 opacity-100 sm:-mx-6 sm:mt-5 sm:-mb-1 sm:px-6 sm:pt-4":
							showFullBytecode,
						},
					)}
				>
					{bytecode}
				</div>
			</DetailWrapper>
		</div>
	);
};
