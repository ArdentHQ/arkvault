import { styled } from "twin.macro";

import { ColorType, getStyles } from "./Label.styles";
import { Size } from "@/types";

export interface LabelProperties {
	color?: ColorType;
	size?: Size;
	variant?: "solid";
	noBorder?: boolean;
}

export const Label = styled.div<LabelProperties>(getStyles);

Label.defaultProps = { color: "primary" };
