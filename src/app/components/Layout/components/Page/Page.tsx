import React, { FC } from "react";

import cn from "classnames";
import { PageProperties } from "./Page.contracts";
import { NavigationBar } from "@/app/components/NavigationBar";
import { useDocumentTitle } from "@/app/hooks/use-document-title";
import { useNavigationContext } from "@/app/contexts";

export const Page: FC<PageProperties> = ({
	navbarVariant = "full",
	title,
	pageTitle,
	isBackDisabled,
	sidebar,
	children,
}) => {
	useDocumentTitle(pageTitle);

	const { showMobileNavigation, hasFixedFormButtons } = useNavigationContext();

	const renderWithSidebar = () => (
		<div className="flex flex-1">
			<div className="mx-auto flex w-full flex-col lg:container lg:flex-row">
				<div className="mt-8 border-theme-primary-100 px-8 dark:border-theme-secondary-800 md:px-10 lg:mb-8 lg:border-r lg:px-12">
					{sidebar}
				</div>

				<div className="w-full">{children}</div>
			</div>
		</div>
	);

	return (
		<div
			className={cn("relative flex min-h-screen flex-col", {
				"pb-14 sm:pb-0": showMobileNavigation && !hasFixedFormButtons,
				"pb-32 sm:pb-0": showMobileNavigation && hasFixedFormButtons,
			})}
		>
			<NavigationBar variant={navbarVariant} title={title} isBackDisabled={isBackDisabled} />

			<div className="flex flex-1 flex-col">{sidebar ? renderWithSidebar() : children}</div>
		</div>
	);
};
