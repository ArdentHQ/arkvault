import { styled } from "twin.macro";

import { getStyles } from "./Spinner.styles";
import { Color, Size } from "@/types";

interface SpinnerType {
	color?: Color;
	size?: Size;
}

export const Spinner = styled.div<SpinnerType>(getStyles);

Spinner.defaultProps = {
	color: "info",
};
