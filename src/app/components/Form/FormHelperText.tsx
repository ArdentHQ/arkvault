import React from "react";

import { useFormField } from "./useFormField";

interface FormHelperTextProperties {
	isInvalid?: boolean;
	errorMessage?: React.ReactNode;
	children?: React.ReactNode;
}

export const FormHelperText: React.FC<FormHelperTextProperties> = ({ children, ...properties }) => {
	const fieldContext = useFormField();
	const isInvalid = properties.isInvalid || fieldContext?.isInvalid;
	const errorMessage = properties.errorMessage || fieldContext?.errorMessage;

	if (isInvalid) {
		return <p className="text-theme-danger-500 text-sm font-normal">{errorMessage}</p>;
	}

	if (children) {
		return <p className="text-theme-secondary-500 text-sm font-normal">{children}</p>;
	}

	return <></>;
};
