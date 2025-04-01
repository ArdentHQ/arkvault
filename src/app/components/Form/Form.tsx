import React from "react";
import { FormProvider } from "react-hook-form";
import { FormProperties } from "@/app/components/Form/Form.contracts";
import { twMerge } from "tailwind-merge";

export const Form = React.forwardRef<HTMLFormElement, FormProperties>(
	({ children, context, onSubmit, className, ...properties }, reference) => (
		<FormProvider {...context}>
			<form
				data-testid="Form"
				ref={reference}
				className={twMerge("space-y-5", className)}
				onSubmit={onSubmit ? context.handleSubmit(onSubmit) : (event) => event.preventDefault()}
				{...properties}
			>
				{children}
			</form>
		</FormProvider>
	),
);

Form.displayName = "Form";
