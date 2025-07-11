import React from "react";
import { Services } from "@/app/lib/mainsail";
import { Contracts as ProfileContracts } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { FormField } from "@/app/components/Form";
import { DetailLabelText, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { useActiveProfile, useWalletAlias } from "@/app/hooks";

export const SigningMessageInfo = ({
	message,
	wallet,
}: {
	message?: string;
	wallet: ProfileContracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();
	const { getWalletAlias } = useWalletAlias();
	const profile = useActiveProfile();

	return (
		<div className="space-y-4">
			<DetailWrapper label={t("COMMON.SIGNING_ADDRESS")}>
				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle>{t("COMMON.ADDRESS")}</DetailTitle>
					<Address
						truncateOnTable
						address={wallet.address()}
						walletName={
							getWalletAlias({
								address: wallet.address(),
								network: wallet.network(),
								profile,
							}).alias
						}
						showCopyButton
						walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
						addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-700 text-sm leading-[17px] sm:leading-5 sm:text-base w-full w-3/4"
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

	return (
		<section>
			<div className="space-y-4">
				<SigningMessageInfo message={signedMessage.message} wallet={wallet} />

				<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 border-t px-3 py-6 sm:border-t-0 sm:p-0">
					<FormField name="json-signature">
						<DetailLabelText>{t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.SIGNATURE_JSON")}</DetailLabelText>
						<pre
							data-testid="SignMessage__signature-json"
							className="border-theme-secondary-300 dark:border-theme-dark-500 dim:border-theme-dim-700 dark:text-theme-dark-50 dim:text-theme-dim-50 text-theme-secondary-900 mt-2 rounded-sm border p-4 break-all whitespace-normal select-text"
						>
							{JSON.stringify(signedMessage, null, 2)}
						</pre>
					</FormField>
				</div>
			</div>
		</section>
	);
};
