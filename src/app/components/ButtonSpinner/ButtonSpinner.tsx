import { styled } from "twin.macro";

import { getStyles } from "./ButtonSpinner.styles";
import { ButtonVariant } from "@/types";

interface ButtonSpinnerType {
	variant: ButtonVariant | undefined;
}

export const ButtonSpinner = styled.div<ButtonSpinnerType>(getStyles);

ButtonSpinner.defaultProps = { variant: "primary" };
