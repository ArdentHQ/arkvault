import React, { ReactElement, useEffect, useState } from "react";
import { Clipboard } from "@/app/components/Clipboard";
import { twMerge } from "tailwind-merge";
import { getStyles } from "@/app/components/Button/Button.styles";
import { useTheme } from "@/app/hooks";

export const Copy = ({
	copyData,
	tooltip,
	icon,
}: {
	copyData: string;
	tooltip?: string;
	icon?: (isCopied?: boolean) => ReactElement;
}): ReactElement => {
	const [isClicked, setIsClicked] = useState<boolean>(false);
	const { isDarkMode } = useTheme();

	useEffect(() => {
		if (isClicked) {
			const timer = setTimeout(() => {
				setIsClicked(false);
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [isClicked, 1000]);

	return (
		<Clipboard
			variant="icon"
			data={copyData}
			tooltip={tooltip}
			tooltipDarkTheme={isDarkMode}
			iconButtonClassName={twMerge(getStyles({ variant: "primary-transparent" }), "p-1")}
		>
			<span onClick={() => setIsClicked(true)}>{icon?.(isClicked)}</span>
		</Clipboard>
	);
};
