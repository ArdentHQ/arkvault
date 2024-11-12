import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import {
	TransactionAddresses,
	TransactionMusigParticipants,
	TransactionType,
} from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon } from "@/app/components/Icon";
import { FormField } from "@/app/components/Form";
import { DetailLabel } from "@/app/components/DetailWrapper";
import { useMusigRegistrationStubTransaction } from "@/domains/transaction/hooks/use-stub-transaction";
import { transactionPublicKeys } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";

export const ReviewStep = ({
	wallet,
	profile,
}: {
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}) => {
	const { t } = useTranslation();
	const { unregister, watch } = useFormContext();
	const { fee, participants, minParticipants: min } = watch();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	const { musigRegistrationStubTransaction } = useMusigRegistrationStubTransaction({
		fee,
		min,
		publicKeys: participants.map((participant) => participant.publicKey),
		wallet,
	});

	return (
		<section data-testid="MultiSignature__review-step">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SendTransactionLight"
						darkIcon="SendTransactionDark"
						greenLightIcon="SendTransactionLightGreen"
						greenDarkIcon="SendTransactionDarkGreen"
					/>
				}
			/>

			<div className="-mx-3 space-y-4 pt-5 sm:mx-0">
				<FormField name="senderAddress">
					<TransactionAddresses
						senderAddress={wallet.address()}
						network={wallet.network()}
						recipients={[]}
						profile={profile}
						labelClassName="min-w-24"
					/>
				</FormField>

				{musigRegistrationStubTransaction && (
					<>
						<TransactionType transaction={musigRegistrationStubTransaction} />

						<DetailLabel>{t("TRANSACTION.PARTICIPANTS")}</DetailLabel>
						<div className="mt-2">
							<TransactionMusigParticipants
								publicKeys={transactionPublicKeys(musigRegistrationStubTransaction).publicKeys}
								profile={profile}
								network={wallet.network()}
							/>
						</div>
					</>
				)}

				<div data-testid="DetailWrapper">
					<DetailLabel>{t("COMMON.TRANSACTION_SUMMARY")}</DetailLabel>
					<div className="mt-0 p-3 sm:mt-2 sm:p-0">
						<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
					</div>
				</div>
			</div>
		</section>
	);
};
