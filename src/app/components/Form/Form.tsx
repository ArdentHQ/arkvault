import React from "react";
import { FormProvider } from "react-hook-form";

import { FormProperties } from "@/app/components/Form/Form.contracts";

export const Form = React.forwardRef<HTMLFormElement, FormProperties>(
	({ children, context, onSubmit, ...properties }, reference) => (
		<FormProvider {...context}>
			<form
				data-testid="Form"
				ref={reference}
				className="space-y-5"
				onSubmit={onSubmit ? context.handleSubmit(onSubmit) : (event) => event.preventDefault()}
				{...properties}
			>
				{children}
			</form>
		</FormProvider>
	),
);

Form.displayName = "Form";
