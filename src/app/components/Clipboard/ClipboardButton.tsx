import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { styled } from "twin.macro";

import { ClipboardButtonProperties } from "./Clipboard.contracts";
import { getStyles } from "@/app/components/Button/Button.styles";
import { Icon } from "@/app/components/Icon";
import { useClipboard } from "@/app/hooks";
import { ButtonVariant, Size, Theme } from "@/types";

type ButtonProperties = {
	variant?: ButtonVariant;
	size?: Size;
	theme?: Theme;
} & React.ButtonHTMLAttributes<any>;
const StyledButton = styled.button<ButtonProperties>(getStyles);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ClipboardButton = ({
	buttonVariant = "secondary",
	data,
	options,
	wrapperClassName,
	children,
	...properties
}: Omit<ClipboardButtonProperties, "variant">) => {
	const [hasCopied, copy] = useClipboard({
		resetAfter: 1000,
		...options,
	});

	return (
		<div className={cn("relative", wrapperClassName)}>
			<StyledButton
				type="button"
				onClick={() => copy(data)}
				data-testid="clipboard-button__wrapper"
				variant={buttonVariant}
				{...properties}
			>
				<div className="flex items-center space-x-2">{children}</div>
			</StyledButton>

			<AnimatePresence>
				{hasCopied && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1, transition: { duration: 0.3 } }}
						exit={{ opacity: 0, transition: { duration: 0.3 } }}
						className={cn("absolute inset-0 flex items-center justify-center rounded", {
							"bg-theme-primary-100 dark:bg-theme-secondary-800": buttonVariant === "secondary",
							"bg-theme-primary-700": buttonVariant === "primary",
						})}
						data-testid="clipboard-button__checkmark"
					>
						<Icon
							name="Checkmark"
							className={cn({
								"text-theme-primary-600 dark:text-theme-secondary-200": buttonVariant === "secondary",
								"text-white": buttonVariant === "primary",
							})}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
