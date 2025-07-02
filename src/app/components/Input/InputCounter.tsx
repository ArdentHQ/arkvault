import cn from "classnames";
import React, { useEffect, useState } from "react";

import { useFormField } from "@/app/components/Form/useFormField";
import { Input } from "@/app/components/Input";

type Properties = {
	maxLength?: number;
	maxLengthLabel?: string;
	defaultValue?: string;
	ref?: React.Ref<HTMLInputElement>;
} & React.InputHTMLAttributes<any>;

export const InputCounter = (properties: Properties) => {
	const fieldContext = useFormField();
	const [length, setLength] = useState(properties.defaultValue?.length || 0);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setLength(event.target.value.length);
		properties.onChange?.(event);
	};

	useEffect(() => {
		if (!!properties.value && properties.value !== properties.defaultValue) {
			setLength(String(properties.value).length);
		}
	}, [properties.value]);

	return (
		<Input
			data-testid="InputCounter__input"
			{...properties}
			onChange={handleChange}
			addons={{
				end: {
					content: (
						<span
							data-testid="InputCounter__counter"
							className={cn("text-sm font-semibold", {
								"text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-700":
									!fieldContext?.isInvalid,
							})}
						>
							{length}/{properties.maxLengthLabel}
						</span>
					),
				},
			}}
		/>
	);
};

InputCounter.displayName = "InputCounter";
