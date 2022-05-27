import React, { useEffect } from "react";
import tw, { styled, css } from "twin.macro";
import { useNavigationContext } from "@/app/contexts";

const FormButtonsWrapper = styled.div<{
	showMobileNavigation?: boolean;
}>`
	${({ showMobileNavigation }) => showMobileNavigation && tw`mb-14 sm:mb-0`};
	${tw`flex fixed bg-theme-background dark:bg-black sm:dark:bg-transparent inset-x-0 bottom-0 px-8 py-3 gap-3 shadow-footer-smooth dark:shadow-footer-smooth-dark`}
	${tw`sm:(relative inset-auto p-0 mt-8 justify-end shadow-none dark:shadow-none)`}
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

	useEffect(() => {
		setHasFixedFormButtons(true);
		return () => {
			setHasFixedFormButtons(false);
		};
	});

	return <FormButtonsWrapper showMobileNavigation={showMobileNavigation}>{children}</FormButtonsWrapper>;
};

export { FormButtons, FormButtonsWrapper };
