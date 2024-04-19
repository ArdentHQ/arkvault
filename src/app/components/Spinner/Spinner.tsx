import { styled } from "twin.macro";

import { getStyles } from "./Spinner.styles";
import { Color, Size, Theme } from "@/types";

interface SpinnerType {
	color?: Color | "warning-alt";
	size?: Size;
	theme?: Theme;
	width?: number;
}

export const Spinner = styled.div<SpinnerType>(getStyles);

Spinner.defaultProps = {
	color: "info",
};
