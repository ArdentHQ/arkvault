import React from "react";
import { FieldValues, SubmitHandler, UseFormReturn } from "react-hook-form";

export type FormProperties<T extends FieldValues = any> = {
	onSubmit?: SubmitHandler<T>;
	context: UseFormReturn<T>;
	ref?: React.Ref<HTMLFormElement>;
} & Omit<React.FormHTMLAttributes<Element>, "onSubmit">;
