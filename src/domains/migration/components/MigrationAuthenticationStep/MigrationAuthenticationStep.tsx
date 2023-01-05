import React from "react";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useFormContext } from "react-hook-form";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";

export const MigrationAuthenticationStep = ({
	wallet,
	onContinue,
	onCancel,
}: {
	wallet: Contracts.IReadWriteWallet;
	onContinue: () => void;
	onCancel: () => void;
}) => {
	const { t } = useTranslation();
	const { formState } = useFormContext();

	return (
		<div>
			<AuthenticationStep wallet={wallet} />

			<div className="px-5 pb-5">
				<FormButtons>
					<Button data-testid="MigrationAdd__cancel-btn" variant="secondary" onClick={onCancel}>
						{t("COMMON.CANCEL")}
					</Button>

					<Button
						data-testid="MigrationAdd__cancel__continue-btn"
						type="submit"
						variant="primary"
						disabled={!formState.isValid}
						onClick={onContinue}
					>
						{t("COMMON.CONTINUE")}
					</Button>
				</FormButtons>
			</div>
		</div>
	);
};
