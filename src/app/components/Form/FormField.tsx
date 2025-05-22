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
			className="flex flex-col min-w-0"
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
