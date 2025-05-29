import cn from "classnames";
import React from "react";

import { Input } from "@/app/components/Input";

type InputDefaultProperties = {
	className?: string;
	ref?: React.Ref<HTMLInputElement>;
} & React.InputHTMLAttributes<any>;

export const InputDefault = ({ className, ...properties }: InputDefaultProperties) => (
	<Input className={cn(className)} {...properties} />
);

InputDefault.displayName = "InputDefault";
