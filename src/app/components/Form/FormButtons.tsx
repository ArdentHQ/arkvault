import React, { useEffect } from "react";
import tw, { styled, css } from "twin.macro";
import { useNavigationContext } from "@/app/contexts";
import { useInputFocus, useBreakpoint } from "@/app/hooks";

const FormButtonsWrapper = styled.div<{
	showMobileNavigation?: boolean;
}>`
	${({ showMobileNavigation }) => showMobileNavigation && tw`sm:mb-0`};
	${({ showMobileNavigation }) =>
		showMobileNavigation &&
		css`
			@media (max-width: 639px) {
				margin-bottom: 3.5rem;
				@supports (margin-bottom: env(safe-area-inset-bottom)) {
					margin-bottom: calc(env(safe-area-inset-bottom) + 3.5rem);
				}
			}
		`};
	${({ showMobileNavigation }) =>
		!showMobileNavigation &&
		css`
			@media (max-width: 639px) {
				@supports (padding-bottom: env(safe-area-inset-bottom)) {
					padding-bottom: calc(env(safe-area-inset-bottom) + 0.75rem);
				}
			}
		`};
	${tw`flex fixed bg-theme-background dark:bg-black sm:bg-transparent sm:dark:bg-transparent inset-x-0 bottom-0 px-8 py-3 gap-3 shadow-footer-smooth dark:shadow-footer-smooth-dark`}
	${tw`sm:(relative inset-auto p-0 mt-6 justify-end shadow-none dark:shadow-none)`}
	${css`
		& > button {
			${tw`flex-1 sm:flex-none`}
		}
	`}
`;

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
