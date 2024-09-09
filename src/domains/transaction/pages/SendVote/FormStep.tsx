import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { SendVoteStepProperties } from "./SendVote.contracts";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { StepHeader } from "@/app/components/StepHeader";
import {DetailLabel, DetailTitle, DetailWrapper} from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { ThemeIcon } from "@/app/components/Icon";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import {SelectAddress} from "@/domains/profile/components/SelectAddress";
import { useFormContext } from "react-hook-form";

type FormStepProperties = {
	profile: ProfilesContracts.IProfile;
	wallet?: ProfilesContracts.IReadWriteWallet;
	isWalletFieldDisabled?: boolean;
} & Omit<SendVoteStepProperties, "wallet">;

export const FormStep = ({ unvotes, votes, wallet, profile, network, isWalletFieldDisabled }: FormStepProperties) => {
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

	const { setValue } = useFormContext();

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
				<FormLabel label={t("TRANSACTION.SENDER")} />

				<div data-testid="sender-address" className="mb-3 sm:mb-0">
					<SelectAddress
						showWalletAvatar={false}
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
						wallets={profile.wallets().findByCoinWithNetwork(network.coin(), network.id())}
						profile={profile}
						onChange={(address: string) =>
							setValue("senderAddress", address, { shouldDirty: true, shouldValidate: false })
						}
					/>
				</div>
			</FormField>

			<VoteTransactionType votes={votes} unvotes={unvotes}/>

			{showFeeInput && (
				<FormField name="fee" className="flex-1">
					<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")}/>
					<FeeField type="vote" data={feeTransactionData} network={network} profile={profile}/>
				</FormField>
			)}
		</section>
	);
};
