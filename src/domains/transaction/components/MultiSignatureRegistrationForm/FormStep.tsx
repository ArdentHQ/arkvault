import cn from "classnames";
import React, { ChangeEvent, useCallback, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AddParticipant, Participant } from "./components/AddParticipant/AddParticipant";
import { FormField, FormLabel } from "@/app/components/Form";
import { Input } from "@/app/components/Input";
import { useValidation } from "@/app/hooks";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { FormStepProperties } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { StepHeader } from "@/app/components/StepHeader";
import {ThemeIcon} from "@/app/components/Icon";
import {TransactionAddresses} from "@/domains/transaction/components/TransactionDetail";

const MINIMUM_PARTICIPANTS = 2;

export const FormStep = ({ profile, wallet }: FormStepProperties) => {
	const { t } = useTranslation();
	const { errors, setValue, register, watch } = useFormContext();
	const { participants, minParticipants } = watch();

	const { common, multiSignatureRegistration } = useValidation();

	useEffect(() => {
		register("participants", multiSignatureRegistration.participants());
		register("minParticipants", multiSignatureRegistration.minParticipants(participants));
	}, [register, participants, common, multiSignatureRegistration, wallet]);

	useEffect(() => {
		if (minParticipants === undefined) {
			setValue("minParticipants", MINIMUM_PARTICIPANTS, { shouldDirty: true, shouldValidate: true });
		}

		if (minParticipants > MINIMUM_PARTICIPANTS && minParticipants > participants?.length) {
			setValue("minParticipants", participants.length, { shouldDirty: true, shouldValidate: true });
		}
	}, [setValue, minParticipants, participants]);

	const network = useMemo(() => wallet.network(), [wallet]);
	const feeTransactionData = useMemo(() => ({ minParticipants, participants }), [minParticipants, participants]);

	const handleParticipants = useCallback(
		(values: Participant[]) => {
			setValue("participants", values, { shouldDirty: true, shouldValidate: true });
		},
		[setValue],
	);

	const handleInput = (event_: ChangeEvent<HTMLInputElement>) => {
		setValue(event_.target.name, event_.target.value, { shouldDirty: true, shouldValidate: true });
	};

	const minParticipantsLimit = Math.max(MINIMUM_PARTICIPANTS, participants?.length || 0);

	return (
		<section data-testid="MultiSignatureRegistrationForm--form-step">
			<StepHeader
				title={t("TRANSACTION.PAGE_MULTISIGNATURE.FORM_STEP.TITLE")}
				subtitle={t("TRANSACTION.PAGE_MULTISIGNATURE.FORM_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon dimensions={[24, 24]} lightIcon="SendTransactionLight" darkIcon="SendTransactionDark" />
				}
			/>

			<div className="space-y-4 pt-5">
				<FormField name="senderAddress">
					<TransactionAddresses senderAddress={wallet.address()} network={wallet.network()} recipients={[]} profile={profile} />
				</FormField>

				<div>
					<AddParticipant
						profile={profile}
						wallet={wallet}
						onChange={handleParticipants}
						defaultParticipants={participants}
					/>
				</div>

				<FormField name="minParticipants">
					<FormLabel>{t("TRANSACTION.MULTISIGNATURE.MIN_SIGNATURES")}</FormLabel>
					<Input
						data-testid="MultiSignatureRegistrationForm__min-participants"
						type="number"
						min={2}
						max={minParticipantsLimit}
						value={minParticipants ?? 0}
						onChange={handleInput}
						addons={{
							end: {
								content: (
									<span
										className={cn("pointer-events-none text-sm font-semibold", {
											"text-theme-secondary-500 dark:text-theme-secondary-700":
												!errors?.minParticipants,
										})}
									>
										{t("TRANSACTION.MULTISIGNATURE.OUT_OF_LENGTH", {
											length: minParticipantsLimit,
										})}
									</span>
								),
							},
						}}
					/>
				</FormField>

				<FormField name="fee">
					<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
					<FeeField type="multiSignature" data={feeTransactionData} network={network} profile={profile} />
				</FormField>
			</div>
		</section>
	);
};
