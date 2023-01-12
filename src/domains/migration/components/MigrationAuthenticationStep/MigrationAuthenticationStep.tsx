import React, { useEffect } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useFormContext } from "react-hook-form";

import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import MigrationStep from "@/domains/migration/components/MigrationStep";
import { MigrationReview } from "@/domains/migration/components/MigrationReviewStep";
import { useActiveProfile } from "@/app/hooks";
import { useLedgerContext } from "@/app/contexts";
import { useMigrationTransaction, useAuthenticationHeading } from "@/domains/migration/hooks";
import { assertWallet } from "@/utils/assertions";

export const MigrationAuthenticationStep = ({
	wallet,
	onContinue,
	onBack,
	onError,
}: {
	wallet?: Contracts.IReadWriteWallet;
	onContinue?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onBack?: () => void;
	onError?: (error: Error) => void;
}) => {
	const profile = useActiveProfile();

	assertWallet(wallet);

	const { formState } = useFormContext();
	const { title, description } = useAuthenticationHeading({ wallet });
	const { sendTransaction, isSending, abortTransaction } = useMigrationTransaction({ profile, wallet });
	const { hasDeviceAvailable, isConnected, ledgerDevice } = useLedgerContext();

	useEffect(() => {
		if (wallet.isLedger()) {
			handleSendTransaction();
		}

		return () => {
			abortTransaction();
		};
	}, []);

	const handleSendTransaction = async () => {
		try {
			const transaction = await sendTransaction();
			onContinue?.(transaction);
		} catch (error) {
			console.log({ error });
			onError?.(error);
		}
	};

	return (
		<div>
			<MigrationStep
				title={title}
				description={description}
				onBack={wallet.isLedger() ? undefined : onBack}
				onContinue={wallet.isLedger() ? undefined : handleSendTransaction}
				isValid={formState.isValid && !isSending}
				isLoading={isSending}
			>
				<div className="space-y-8 px-5 pt-6">
					<AuthenticationStep
						wallet={wallet}
						noHeading
						ledgerIsAwaitingApp={!isConnected}
						ledgerIsAwaitingDevice={!hasDeviceAvailable}
						ledgerConnectedModel={ledgerDevice?.id}
					/>

					{wallet.isLedger() && <MigrationReview wallet={wallet} className="pb-4" />}
				</div>
			</MigrationStep>
		</div>
	);
};
