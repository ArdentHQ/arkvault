import React, { useEffect } from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";

import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { MigrationReview } from "@/domains/migration/components/MigrationReviewStep";
import { useActiveProfile } from "@/app/hooks";
import { useLedgerContext } from "@/app/contexts";
import { useMigrationTransaction, useAuthenticationHeading } from "@/domains/migration/hooks";
import { Header } from "@/app/components/Header";

export const MigrationAuthenticationStep = ({
	wallet,
	onContinue,
	onError,
}: {
	wallet: Contracts.IReadWriteWallet;
	onContinue?: (transaction: DTO.ExtendedSignedTransactionData) => void;
	onError?: (error: Error) => void;
}) => {
	const profile = useActiveProfile();

	const { title, description } = useAuthenticationHeading({ wallet });
	const { sendTransaction, abortTransaction } = useMigrationTransaction({ profile, wallet });
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
			onError?.(error);
		}
	};

	return (
		<>
			<Header title={title} subtitle={description} />

			<div className="mt-6 space-y-8">
				<AuthenticationStep
					wallet={wallet}
					noHeading
					ledgerIsAwaitingApp={!isConnected}
					ledgerIsAwaitingDevice={!hasDeviceAvailable}
					ledgerConnectedModel={ledgerDevice?.id}
				/>

				{wallet.isLedger() && <MigrationReview wallet={wallet} />}
			</div>
		</>
	);
};
