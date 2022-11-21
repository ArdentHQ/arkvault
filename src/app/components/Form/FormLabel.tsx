import React from "react";
import { useTranslation } from "react-i18next";

import { useFormField } from "./useFormField";
import { Tooltip } from "@/app/components/Tooltip";

type FormLabelProperties = {
	label?: string;
	optional?: boolean;
} & React.LabelHTMLAttributes<any>;

export function FormLabel(properties: FormLabelProperties) {
	const fieldContext = useFormField();

	const labelProperties = { ...properties };

	for (const property of ["label", "optional"]) {
		// @ts-ignore
		delete labelProperties[property];
	}

	const { t } = useTranslation();

	return (
		<label
			data-testid="FormLabel"
			className="FormLabel mb-2 flex text-sm font-semibold text-theme-secondary-text transition-colors duration-100"
			htmlFor={fieldContext?.name}
			{...labelProperties}
		>
			<>
				{properties.label || properties.children}

				{properties.optional && (
					<Tooltip content={t("COMMON.VALIDATION.OPTIONAL")}>
						<span
							data-testid="FormLabel__optional"
							className="ml-1 text-theme-secondary-500 dark:text-theme-secondary-700"
						>
							{t("COMMON.OPTIONAL")}
						</span>
					</Tooltip>
				)}
			</>
		</label>
	);
}
