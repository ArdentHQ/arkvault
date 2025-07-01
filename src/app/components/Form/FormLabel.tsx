import React from "react";
import { useTranslation } from "react-i18next";

import { useFormField } from "./useFormField";
import { Tooltip } from "@/app/components/Tooltip";
import cn from "classnames";

type FormLabelProperties = {
	label?: string;
	optional?: boolean;
	textClassName?: string;
} & React.LabelHTMLAttributes<any>;

export function FormLabel({ textClassName = "text-sm", ...properties }: FormLabelProperties) {
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
			className={cn(
				"FormLabel text-theme-secondary-text hover:text-theme-primary-600! mb-2 flex leading-[17px] font-semibold transition-colors duration-100",
				textClassName,
			)}
			htmlFor={fieldContext?.name}
			{...labelProperties}
		>
			<>
				{properties.label || properties.children}

				{properties.optional && (
					<Tooltip content={t("COMMON.VALIDATION.OPTIONAL")}>
						<span
							data-testid="FormLabel__optional"
							className="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-500 ml-1"
						>
							{t("COMMON.OPTIONAL")}
						</span>
					</Tooltip>
				)}
			</>
		</label>
	);
}
