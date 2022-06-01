import React from "react";
import { styled } from "twin.macro";

import { getStyles } from "./Checkbox.styles";
import { Color } from "@/types";

type CheckboxProperties = {
	color?: Color;
} & React.InputHTMLAttributes<any>;

export const Checkbox = styled.input<CheckboxProperties>(getStyles);

Checkbox.defaultProps = {
	color: "success",
	type: "checkbox",
};
