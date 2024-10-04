import { Services } from "@ardenthq/sdk";
import { Contracts as ProfileContracts } from "@ardenthq/sdk-profiles";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { FormField } from "@/app/components/Form";
import { StepHeader } from "@/app/components/StepHeader";
import { TextArea } from "@/app/components/TextArea";
import { DetailLabel, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Icon } from "@/app/components/Icon";

export const SigningMessageInfo = ({
	message,
	wallet,
}: {
	message?: string;
	wallet: ProfileContracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();
	return (
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
				<p>{message}</p>
			</DetailWrapper>
		</div>
	);
};

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
			<StepHeader
				title={t("MESSAGE.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE")}
				titleIcon={
					<Icon
						className="text-theme-success-100 dark:text-theme-success-900"
						dimensions={[24, 24]}
						name="Completed"
						data-testid="icon-Completed"
					/>
				}
			/>

			<div className="mt-4 space-y-4">
				<SigningMessageInfo message={signedMessage.message} wallet={wallet} />

				<div>
					<FormField name="json-signature">
						<DetailLabel>{t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.SIGNATURE_JSON")}</DetailLabel>
						<TextArea
							className="mt-2 py-4"
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
