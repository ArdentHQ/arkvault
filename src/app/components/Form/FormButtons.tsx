import React, { useEffect } from "react";
import { useNavigationContext } from "@/app/contexts";
import { useInputFocus, useBreakpoint } from "@/app/hooks";
import { twMerge } from "tailwind-merge";
import cn from 'classnames';

const FormButtonsWrapper = ({ showMobileNavigation, ...props }: { showMobileNavigation?: boolean } & React.HTMLAttributes<HTMLDivElement>) => (
		<div
			{...props}
			className={twMerge("flex fixed bg-theme-background dark:bg-black sm:bg-transparent sm:dark:bg-transparent inset-x-0 bottom-0 px-8 py-3 gap-3 shadow-footer-smooth dark:shadow-footer-smooth-dark sm:relative sm:inset-auto sm:p-0 sm:mt-6 sm:justify-end sm:shadow-none sm:dark:shadow-none [&>button]:flex-1 sm:[&>button]:flex-none", cn({
				"pb-3 sm:pb-0": !showMobileNavigation,
				"sm:mb-0 mb-14": showMobileNavigation
			}), props.className)}
		/>
	)

const FormButtons: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const { showMobileNavigation, setHasFixedFormButtons } = useNavigationContext();
	const { isInputElementFocused } = useInputFocus();
	const { isXs, isSm } = useBreakpoint();

	useEffect(() => {
		setHasFixedFormButtons(true);
		return () => {
			setHasFixedFormButtons(false);
		};
	});

	if (isInputElementFocused && (isXs || isSm)) {
		return <FormButtonsWrapper>{children}</FormButtonsWrapper>;
	}

	return <FormButtonsWrapper showMobileNavigation={showMobileNavigation}>{children}</FormButtonsWrapper>;
};

export { FormButtons, FormButtonsWrapper };
