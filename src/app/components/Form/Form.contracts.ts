import React from "react";
import { FieldValues, SubmitHandler, UseFormMethods } from "react-hook-form";

export type FormProperties<T extends FieldValues = any> = {
	onSubmit?: SubmitHandler<T>;
	context: UseFormMethods<T>;
	ref?: React.Ref<HTMLFormElement>;
} & Omit<React.FormHTMLAttributes<Element>, "onSubmit">;
