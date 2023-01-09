import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useFormContext } from "react-hook-form";
import { AuthenticationStep, useAuthenticationHeading } from "@/domains/transaction/components/AuthenticationStep";
import MigrationStep from "@/domains/migration/components/MigrationStep";

export const MigrationAuthenticationStep = ({
	wallet,
	onContinue,
	onBack,
}: {
	wallet: Contracts.IReadWriteWallet;
	onContinue: () => void;
	onBack: () => void;
}) => {
	const { formState } = useFormContext();
	const { title, description } = useAuthenticationHeading({ wallet });

	return (
		<div>
			<MigrationStep
				title={title}
				description={description}
				onBack={onBack}
				onContinue={onContinue}
				isValid={formState.isValid}
			>
				<div className="px-4 pt-4">
					<AuthenticationStep wallet={wallet} noHeading />
				</div>
			</MigrationStep>
		</div>
	);
};
