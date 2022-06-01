import { Size } from "@/types";

export const getStyles = (size?: Size) => {
	if (size === "sm") {
		return "text-xs font-medium";
	}
};
