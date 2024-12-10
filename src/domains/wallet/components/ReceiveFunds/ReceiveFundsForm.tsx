import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormField, FormHelperText, FormLabel } from "@/app/components/Form";
import { InputCurrency } from "@/app/components/Input";
import { Networks } from "@ardenthq/sdk";

export const ReceiveFundsForm = ({network}: {network: Networks.Network}) => {
	const { t } = useTranslation();

	const form = useFormContext();
	const { getValues, setValue, register } = form;

	useEffect(() => {
		register("amount");
	}, [register]);

	return (
		<div data-testid="ReceiveFundsForm">
			<div className="mt-4">
				<FormField name="amount">
					<FormLabel label={t("COMMON.AMOUNT")} optional />
					<InputCurrency
						network={network}
						data-testid="ReceiveFundsForm__amount"
						placeholder={t("COMMON.AMOUNT")}
						className="pr-20"
						value={getValues("amount")}
						onChange={(amount) => setValue("amount", amount)}
					/>
					<FormHelperText />
				</FormField>
			</div>
		</div>
	);
};
