import { get } from "@ardenthq/sdk-helpers";
import React from "react";
import { useFormContext } from "react-hook-form";

import { FormFieldProvider } from "./useFormField";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

type FormFieldProperties = {
	name: string;
	disableHover?: boolean;
} & React.FieldsetHTMLAttributes<any>;

export const FormFieldStyled = ({
	isInvalid,
	disableHover,
	...props
}: { isInvalid: boolean; disableHover: boolean } & React.FieldsetHTMLAttributes<HTMLFieldSetElement>) => (
	<fieldset
		{...props}
		className={twMerge(
			cn({
				"[&:focus-within_.FormLabel]:text-theme-danger-500": isInvalid,
				"[&:focus-within_.FormLabel]:text-theme-secondary-text dark:[&:focus-within_.FormLabel]:text-theme-primary-500":
					!isInvalid,
				"[&>.FormLabel]:text-theme-danger-500": isInvalid,
				"[&>.FormLabel]:text-theme-secondary-text dark:[&>.FormLabel]:text-theme-secondary-500 ":
					!isInvalid && !disableHover,
			}),
			props.className,
		)}
	/>
);

export const FormField: React.FC<FormFieldProperties> = ({ name, disableHover = false, ...properties }) => {
	const FormProvider = useFormContext();
	const { isInvalid, errorMessage } = React.useMemo(() => {
		const error: { message: string } | undefined = get(FormProvider?.errors, name);

		return {
			errorMessage: error?.message,
			isInvalid: !!error,
		};
	}, [FormProvider, name]);

	return (
		<FormFieldStyled
			isInvalid={isInvalid}
			className="flex min-w-0 flex-col"
			disableHover={disableHover}
			{...properties}
		>
			<FormFieldProvider value={{ errorMessage, isInvalid, name }}>
				<>{properties.children}</>
			</FormFieldProvider>
		</FormFieldStyled>
	);
};
