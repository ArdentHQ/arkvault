import React from "react";
import { SubmitHandler, UseFormMethods } from "react-hook-form";
import { FieldValues } from "react-hook-form/dist/types/fields";

export type FormProperties<T extends FieldValues = any> = {
	onSubmit?: SubmitHandler<T>;
	context: UseFormMethods<T>;
} & Omit<React.FormHTMLAttributes<Element>, "onSubmit">;
