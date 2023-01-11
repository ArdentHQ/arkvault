import React from "react";
import { useFormContext } from "react-hook-form";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { MigrationReview } from "@/domains/migration/components/MigrationReviewStep";
import { useLedgerContext } from "@/app/contexts";
import { useAuthenticationHeading } from "@/domains/migration/hooks";
import { Header } from "@/app/components/Header";

export const MigrationAuthenticationStep = () => {
	const { getValues } = useFormContext();
	const { fee, migrationAddress, wallet } = getValues(["fee", "migrationAddress", "wallet"]);

	const { title, description } = useAuthenticationHeading({ wallet });
	const { hasDeviceAvailable, isConnected, ledgerDevice } = useLedgerContext();

	return (
		<>
			<Header title={title} subtitle={description} />

			<div className="mt-6 space-y-8">
				<AuthenticationStep
					wallet={wallet}
					ledgerIsAwaitingApp={!isConnected}
					ledgerIsAwaitingDevice={!hasDeviceAvailable}
					ledgerConnectedModel={ledgerDevice?.id}
					noHeading
				/>

				{wallet.isLedger() && <MigrationReview fee={fee} migrationAddress={migrationAddress} wallet={wallet} />}
			</div>
		</>
	);
};
