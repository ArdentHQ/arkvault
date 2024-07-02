import React, { FC } from "react";
import tw, { css, styled } from "twin.macro";

import { NavigationBar } from "@/app/components/NavigationBar";
import { useNavigationContext } from "@/app/contexts";
import { useDocumentTitle } from "@/app/hooks/use-document-title";

import { PageProperties } from "./Page.contracts";

export const PageWrapper = styled.div<{ showMobileNavigation: boolean; hasFixedFormButtons: boolean }>`
	${css`
		min-height: -webkit-fill-available;
	`}

	${tw`relative flex flex-col sm:min-h-screen`}

	${({ showMobileNavigation, hasFixedFormButtons }) => showMobileNavigation && !hasFixedFormButtons && tw`pb-14 sm:pb-0`}
	${({ showMobileNavigation, hasFixedFormButtons }) => showMobileNavigation && hasFixedFormButtons && tw`pb-32 sm:pb-0`}
`;

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
		<PageWrapper showMobileNavigation={showMobileNavigation} hasFixedFormButtons={hasFixedFormButtons}>
			<NavigationBar variant={navbarVariant} title={title} isBackDisabled={isBackDisabled} />

			<div className="flex flex-1 flex-col">{sidebar ? renderWithSidebar() : children}</div>
		</PageWrapper>
	);
};
