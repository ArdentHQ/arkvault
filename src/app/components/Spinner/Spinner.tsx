import { styled } from "twin.macro";

import { getStyles, SpinnerTheme } from "./Spinner.styles";
import { Color, Size } from "@/types";

interface SpinnerType {
	color?: Color;
	size?: Size;
	theme?: SpinnerTheme;
	width?: number;
}

export const Spinner = styled.div<SpinnerType>(getStyles);

Spinner.defaultProps = {
	color: "info",
};
