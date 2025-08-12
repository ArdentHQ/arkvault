import React, { FC, useEffect } from "react";
import { PageProperties } from "./Page.contracts";
import { NavigationBar } from "@/app/components/NavigationBar";
import { useDocumentTitle } from "@/app/hooks/use-document-title";
import { useNavigationContext } from "@/app/contexts";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

export const PageWrapper = ({
	showMobileNavigation,
	hasFixedFormButtons,
	...props
}: { showMobileNavigation: boolean; hasFixedFormButtons: boolean } & React.HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		style={{ minHeight: "-webkit-fill-available" }}
		className={twMerge(
			"relative flex flex-col sm:min-h-screen",
			cn({
				"pb-14 sm:pb-0": showMobileNavigation && !hasFixedFormButtons,
				"pb-32 sm:pb-0": showMobileNavigation && hasFixedFormButtons,
			}),
			props.className,
		)}
	/>
);

export const Page: FC<PageProperties> = ({
	navbarVariant = "full",
	title,
	pageTitle,
	isBackDisabled,
	children,
	wrapperClassName,
	showBottomNavigationBar,
}) => {
	useDocumentTitle(pageTitle);

	const { showMobileNavigation, hasFixedFormButtons, setShowMobileNavigation } = useNavigationContext();

	useEffect(() => {
		if (showBottomNavigationBar === false) {
			setShowMobileNavigation(false);
			return;
		}
	}, [showMobileNavigation]);

	return (
		<PageWrapper showMobileNavigation={showMobileNavigation} hasFixedFormButtons={hasFixedFormButtons}>
			<NavigationBar variant={navbarVariant} title={title} isBackDisabled={isBackDisabled} />

			<div className={cn("flex flex-1 flex-col", wrapperClassName)}>{children}</div>
		</PageWrapper>
	);
};
