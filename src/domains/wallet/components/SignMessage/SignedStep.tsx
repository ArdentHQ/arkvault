import { Services } from "@payvo/sdk";
import { Contracts as ProfileContracts } from "@payvo/sdk-profiles";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Avatar } from "@/app/components/Avatar";
import { FormField, FormLabel } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { TextArea } from "@/app/components/TextArea";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail";
import { useBreakpoint } from "@/app/hooks";

export const SignedStep = ({
	signedMessage,
	wallet,
}: {
	signedMessage: Services.SignedMessage;
	wallet: ProfileContracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();

	const { isMdAndAbove } = useBreakpoint();

	const messageReference = useRef();
	const walletAlias = wallet.alias();

	const iconSize = isMdAndAbove ? "lg" : "xs";

	return (
		<section>
			<Header title={t("WALLETS.MODAL_SIGN_MESSAGE.SIGNED_STEP.TITLE")} />

			<TransactionDetail
				className="mt-4 md:mt-2"
				borderPosition="bottom"
				label={t("WALLETS.SIGNATORY")}
				extra={<Avatar size={iconSize} address={wallet.address()} />}
			>
				<div className="w-0 flex-1 text-right md:text-left">
					<Address walletName={walletAlias} address={wallet.address()} />
				</div>
			</TransactionDetail>

			<TransactionDetail borderPosition="bottom" label={t("COMMON.MESSAGE")}>
				<span className="min-w-0 whitespace-normal break-words text-right md:text-left">
					{signedMessage.message}
				</span>
			</TransactionDetail>

			<div className="pt-4 md:pt-6">
				<FormField name="json-signature">
					<FormLabel label={t("COMMON.SIGNATURE")} />
					<TextArea
						className="py-4"
						name="signature"
						wrap="hard"
						ref={messageReference}
						defaultValue={JSON.stringify(signedMessage)}
						disabled
					/>
				</FormField>
			</div>
		</section>
	);
};
