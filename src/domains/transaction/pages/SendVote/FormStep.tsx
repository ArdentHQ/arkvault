import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useFormContext } from "react-hook-form";
import { SendVoteStepProperties } from "./SendVote.contracts";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail";
import { VoteList } from "@/domains/vote/components/VoteList";
import { StepHeader } from "@/app/components/StepHeader";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { SelectNetworkDropdown } from "@/app/components/SelectNetworkDropdown";

type FormStepProperties = {
	profile: ProfilesContracts.IProfile;
	wallet?: ProfilesContracts.IReadWriteWallet;
	isWalletFieldDisabled?: boolean;
} & Omit<SendVoteStepProperties, "wallet">;

export const FormStep = ({ unvotes, votes, wallet, profile, network, isWalletFieldDisabled }: FormStepProperties) => {
	const { t } = useTranslation();
	const { setValue } = useFormContext();

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
		<section data-testid="SendVote__form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_VOTE.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_VOTE.FORM_STEP.DESCRIPTION")}
			/>

			<div className="my-8 space-y-8">
				<FormField name="network">
					<FormLabel label={t("COMMON.CRYPTOASSET")} />
					<SelectNetworkDropdown
						profile={profile}
						networks={[network]}
						selectedNetwork={network}
						isDisabled
					/>
				</FormField>

				<FormField name="senderAddress">
					<FormLabel label={t("TRANSACTION.SENDER")} />

					<div data-testid="sender-address">
						<SelectAddress
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
			</div>

			{unvotes.length > 0 && (
				<TransactionDetail label={t("TRANSACTION.UNVOTES_COUNT", { count: unvotes.length })}>
					<VoteList votes={unvotes} currency={wallet?.currency() as string} isNegativeAmount />
				</TransactionDetail>
			)}

			{votes.length > 0 && (
				<TransactionDetail label={t("TRANSACTION.VOTES_COUNT", { count: votes.length })}>
					<VoteList votes={votes} currency={wallet?.currency() as string} />
				</TransactionDetail>
			)}

			{showFeeInput && (
				<TransactionDetail paddingPosition="top">
					<FormField name="fee" className="flex-1">
						<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
						<FeeField type="vote" data={feeTransactionData} network={network} profile={profile} />
					</FormField>
				</TransactionDetail>
			)}
		</section>
	);
};
