import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { SendVoteStepProperties } from "./SendVote.contracts";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon } from "@/app/components/Icon";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";

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

			<FormField name="senderAddress">
				<div data-testid="sender-address" className="mb-3 sm:mb-0">
					{wallet?.address() && <TransactionAddresses senderAddress={wallet.address()} recipients={[]} network={wallet.network()} profile={profile} />}
				</div>
			</FormField>

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
