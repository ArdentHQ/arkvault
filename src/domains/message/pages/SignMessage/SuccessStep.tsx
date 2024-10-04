import { Services } from "@ardenthq/sdk";
import { Contracts as ProfileContracts } from "@ardenthq/sdk-profiles";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { FormField, FormLabel } from "@/app/components/Form";
import { StepHeader } from "@/app/components/StepHeader";
import { TextArea } from "@/app/components/TextArea";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";

export const SuccessStep = ({
	signedMessage,
	wallet,
}: {
	signedMessage: Services.SignedMessage;
	wallet: ProfileContracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();

	const messageReference = useRef();

	return (
		<section>
			<StepHeader title={t("MESSAGE.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE")} />
			<div className="space-y-4">
				<DetailWrapper label={t("COMMON.SIGNING_WALLET")}>
					<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
						<DetailTitle>{t("COMMON.ADDRESS")}</DetailTitle>
						<Address
							truncateOnTable
							address={wallet.address()}
							walletName={wallet.alias()}
							showCopyButton
							walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
							addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4"
							wrapperClass="justify-end sm:justify-start"
						/>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("COMMON.MESSAGE")}>
					<p>{signedMessage.message}</p>
				</DetailWrapper>

				<div>
					<FormField name="json-signature">
						<FormLabel label={t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.JSON_STRING")} />
						<TextArea
							className="py-4"
							wrap="hard"
							ref={messageReference}
							defaultValue={JSON.stringify(signedMessage)}
							disabled
						/>
					</FormField>
				</div>
			</div>
		</section>
	);
};
