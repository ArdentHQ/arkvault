import React, { useEffect } from "react";
import { useNavigationContext } from "@/app/contexts";
import { useBreakpoint } from "@/app/hooks";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

const FormButtonsWrapper = ({
	showMobileNavigation,
	...props
}: { showMobileNavigation?: boolean } & React.HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={twMerge(
			"bg-theme-background dim:bg-theme-dim-950 dark:bg-theme-dark-950 border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 fixed inset-x-0 bottom-0 flex gap-3 border-t px-8 py-3 sm:relative sm:inset-auto sm:mt-6 sm:justify-end sm:bg-transparent sm:p-0 sm:shadow-none sm:dark:bg-transparent sm:dark:shadow-none [&>button]:flex-1 sm:[&>button]:flex-none",
			"[.modal-footer_&]:mt-4 [.modal-footer_&]:sm:-mx-6 [.modal-footer_&]:sm:border-t [.modal-footer_&]:sm:px-6 [.modal-footer_&]:sm:pt-4",
			cn({
				"mb-14 sm:mb-0": showMobileNavigation,
				"pb-3 sm:pb-0": !showMobileNavigation,
			}),
			props.className,
		)}
	/>
);

const FormButtons: React.FC<{
	children: React.ReactNode;
	className?: string;
}> = ({ children, className }) => {
	const { showMobileNavigation, setHasFixedFormButtons } = useNavigationContext();
	const { isXs, isSm } = useBreakpoint();

	useEffect(() => {
		setHasFixedFormButtons(true);
		return () => {
			setHasFixedFormButtons(false);
		};
	});

	if (isXs || isSm) {
		return <FormButtonsWrapper className={className}>{children}</FormButtonsWrapper>;
	}

	return (
		<FormButtonsWrapper showMobileNavigation={showMobileNavigation} className={className}>
			{children}
		</FormButtonsWrapper>
	);
};

export { FormButtons, FormButtonsWrapper };
