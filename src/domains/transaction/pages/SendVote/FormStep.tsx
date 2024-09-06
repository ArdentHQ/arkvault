import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { SendVoteStepProperties } from "./SendVote.contracts";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { StepHeader } from "@/app/components/StepHeader";
import {DetailTitle, DetailWrapper} from "@/app/components/DetailWrapper";
import {Address} from "@/app/components/Address";
import {ThemeIcon} from "@/app/components/Icon";
import {VoteTransactionType} from "@/domains/transaction/components/VoteTransactionType";

type FormStepProperties = {
	profile: ProfilesContracts.IProfile;
	wallet?: ProfilesContracts.IReadWriteWallet;
	isWalletFieldDisabled?: boolean;
} & Omit<SendVoteStepProperties, "wallet">;

export const FormStep = ({ unvotes, votes, wallet, profile, network }: FormStepProperties) => {
	const { t } = useTranslation();

	const showFeeInput = useMemo(() => network.chargesZeroFees() === false, [wallet]);

	const feeTransactionData = useMemo(
		() => ({
			unvotes: unvotes.map((vote) => ({
				amount: vote.amount,
				id: vote.wallet?.governanceIdentifier(),
			})),
			votes: votes.map((vote) => ({
				amount: vote.amount,
				id: vote.wallet?.governanceIdentifier(),
			})),
		}),
		[unvotes, votes, wallet],
	);

	return (
		<section data-testid="SendVote__form-step" className="space-y-3 sm:space-y-4">
			<StepHeader
				title={t("TRANSACTION.PAGE_VOTE.FORM_STEP.TITLE")}
				titleIcon={
					<ThemeIcon dimensions={[24, 24]} lightIcon="SendTransactionLight" darkIcon="SendTransactionDark" />
				}
				subtitle={t("TRANSACTION.PAGE_VOTE.FORM_STEP.DESCRIPTION")}
			/>

			<DetailWrapper label={t("TRANSACTION.ADDRESSING")}>
				<div className="flex w-full items-center justify-between gap-4 space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-auto sm:min-w-28">{t("COMMON.FROM")}</DetailTitle>
					<Address
						address={wallet?.address()}
						walletName={wallet?.alias()}
						walletNameClass="text-theme-text text-sm leading-[17px] sm:leading-5 sm:text-base"
						addressClass="text-theme-secondary-500 dark:text-theme-secondary-700 text-sm leading-[17px] sm:leading-5 sm:text-base"
						wrapperClass="justify-end sm:justify-start"
						showCopyButton
					/>
				</div>
			</DetailWrapper>

			<VoteTransactionType votes={votes} unvotes={unvotes} />

			{showFeeInput && (
				<FormField name="fee" className="flex-1">
					<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
					<FeeField type="vote" data={feeTransactionData} network={network} profile={profile} />
				</FormField>
			)}
		</section>
	);
};
