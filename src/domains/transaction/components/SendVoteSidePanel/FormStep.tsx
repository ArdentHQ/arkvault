import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { SendVoteStepProperties } from "./SendVote.contracts";
import { FormField, FormLabel } from "@/app/components/Form";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon } from "@/app/components/Icon";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { useFormContext } from "react-hook-form";

type FormStepProperties = {
	profile: ProfilesContracts.IProfile;
	wallet?: ProfilesContracts.IReadWriteWallet;
	isWalletFieldDisabled?: boolean;
	hideHeader?: boolean;
} & Omit<SendVoteStepProperties, "wallet">;

export const FormStep = ({
	unvotes,
	votes,
	wallet,
	profile,
	isWalletFieldDisabled,
	hideHeader = false,
}: FormStepProperties) => {
	const { t } = useTranslation();

	const { setValue } = useFormContext();

	return (
		<section data-testid="SendVote__form-step" className="space-y-3 sm:space-y-4">
			{!hideHeader && (
				<StepHeader
					title={t("TRANSACTION.PAGE_VOTE.FORM_STEP.TITLE")}
					titleIcon={
						<ThemeIcon
							dimensions={[24, 24]}
							lightIcon="SendTransactionLight"
							darkIcon="SendTransactionDark"
							dimIcon="SendTransactionDim"
						/>
					}
					subtitle={t("TRANSACTION.PAGE_VOTE.FORM_STEP.DESCRIPTION")}
				/>
			)}

			<FormField name="senderAddress">
				<FormLabel label={t("TRANSACTION.SENDER")} />

				<div data-testid="sender-address" className="mb-3 sm:mb-0">
					<SelectAddress
						inputClassName="bg-transparent! rounded-xl dark:border-theme-dark-700"
						showUserIcon={!isWalletFieldDisabled}
						disabled={isWalletFieldDisabled !== false}
						wallet={
							wallet
								? {
										address: wallet.address(),
										network: wallet.network(),
									}
								: undefined
						}
						wallets={profile.wallets().values()}
						profile={profile}
						onChange={(address: string) =>
							setValue("senderAddress", address, { shouldDirty: true, shouldValidate: false })
						}
					/>
				</div>
			</FormField>

			<VoteTransactionType votes={votes} unvotes={unvotes} />
		</section>
	);
};
