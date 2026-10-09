import { FormFieldProvider } from "./useFormField";
import React from "react";
import cn from "classnames";
import { get } from "@/app/lib/helpers";
import { twMerge } from "tailwind-merge";
import { useFormContext } from "react-hook-form";

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

export const FormField: React.FC<FormFieldProperties> = ({
	name,
	disableHover = false,
	disableStateHints = false,
	...properties
}) => {
	const form = useFormContext();
	const error: { message: string } | undefined = get(form?.formState.errors, name);
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
