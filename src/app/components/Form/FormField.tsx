import { FormFieldProvider } from "./useFormField";
import React from "react";
import cn from "classnames";
import { get } from "@/app/lib/helpers";
import { twMerge } from "tailwind-merge";
import { useFormContext, useFormState } from "react-hook-form";

type FormFieldProperties = {
	name: string;
	disableHover?: boolean;
	disableStateHints?: boolean;
} & React.FieldsetHTMLAttributes<any>;

export const FormFieldStyled = ({
	isInvalid,
	disableHover,
	disableStateHints,
	...props
}: {
	isInvalid: boolean;
	disableHover: boolean;
	disableStateHints: boolean;
} & React.FieldsetHTMLAttributes<HTMLFieldSetElement>) => {
	let classNames = "disableStateHints";

	if (!disableStateHints) {
		classNames = cn({
			"[&:focus-within_.FormLabel]:text-theme-danger-500": isInvalid,
			"[&:focus-within_.FormLabel]:text-theme-primary-600 dark:[&:focus-within_.FormLabel]:text-theme-primary-500":
				!isInvalid && !disableHover,
			"[&:focus-within_.FormLabel]:text-theme-secondary-text": !isInvalid && disableHover,
			"[&>.FormLabel]:text-theme-danger-500": isInvalid,
		});
	}

	return <fieldset {...props} className={twMerge(classNames, props.className)} />;
};

const FormFieldContent = ({
	name,
	error,
	disableHover = false,
	disableStateHints = false,
	...properties
}: FormFieldProperties & { error?: { message?: string } }) => {
	const errorMessage = error?.message;
	const isInvalid = !!error;

	return (
		<FormFieldStyled
			isInvalid={isInvalid}
			className="flex min-w-0 flex-col"
			disableHover={disableHover}
			disableStateHints={disableStateHints}
			{...properties}
		>
			<FormFieldProvider value={{ errorMessage, isInvalid, name }}>
				<>{properties.children}</>
			</FormFieldProvider>
		</FormFieldStyled>
	);
};

const FormFieldWithFormState = (properties: FormFieldProperties) => {
	const { errors } = useFormState({ name: properties.name });

	return <FormFieldContent error={get(errors, properties.name)} {...properties} />;
};

export const FormField: React.FC<FormFieldProperties> = (properties) => {
	const form = useFormContext();

	if (!form) {
		return <FormFieldContent {...properties} />;
	}

	return <FormFieldWithFormState {...properties} />;
};
