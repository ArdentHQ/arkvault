import cn from "classnames";
import tw, { styled } from "twin.macro";
import React from "react";
import { DefaultTFuncReturn } from "i18next";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Size } from "@/types";

interface ModalContentProperties {
	children: React.ReactNode;
	title: string | React.ReactNode;
	titleClass?: string;
	description?: string | JSX.Element | DefaultTFuncReturn;
	banner?: React.ReactNode;
	image?: React.ReactNode;
	onClose?: any;
	hideCloseButton?: boolean;
	noButtons?: boolean;
}

const ModalContainer = styled.div<{ size?: Size }>`
	${tw`flex-1 max-w-full md:m-auto md:px-10`}

	${({ size }) => {
		const sizes = {
			"3xl": () => tw`md:max-w-3xl`,
			"4xl": () => tw`md:max-w-4xl`,
			"5xl": () => tw`md:max-w-5xl`,
			default: () => tw`md:max-w-2xl`,
			lg: () => tw`md:max-w-lg`,
			md: () => tw`md:max-w-md`,
			sm: () => tw`md:max-w-sm`,
			xl: () => tw`md:max-w-xl`,
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (sizes[size as keyof typeof sizes] || sizes.default)();
	}}
`;

const ModalContent = ({
	noButtons = false,
	hideCloseButton,
	onClose,
	banner,
	titleClass,
	title,
	image,
	description,
	children,
}: ModalContentProperties) => (
	<div
		className={cn(
			"relative flex min-h-full flex-col overflow-hidden bg-theme-background shadow-2xl sm:mb-0 md:h-auto md:rounded-2.5xl",
			{
				"p-10": noButtons,
				"px-10 pt-10 pb-24 sm:pb-10": !noButtons,
			},
		)}
		data-testid="Modal__inner"
	>
		{!hideCloseButton && (
			<div className="absolute top-0 right-0 z-10 mt-5 mr-5 rounded bg-theme-primary-100 transition-all duration-100 ease-linear hover:bg-theme-primary-300 dark:bg-theme-secondary-800 dark:text-theme-secondary-600 dark:hover:bg-theme-secondary-700 dark:hover:text-theme-secondary-400">
				<Button
					data-testid="Modal__close-button"
					variant="transparent"
					size="icon"
					onClick={onClose}
					className="h-11 w-11"
				>
					<Icon name="Cross" />
				</Button>
			</div>
		)}

		<div className="relative flex flex-1 flex-col space-y-4">
			{banner && (
				<div className="relative -mx-10 mb-10 -mt-10 h-56">
					{banner}

					<div className="absolute bottom-0 left-0 mb-10 ml-10">
						<h2 className={`m-0 text-4xl font-extrabold leading-tight ${titleClass || "text-theme-text"}`}>
							{title}
						</h2>
					</div>
				</div>
			)}

			{!banner && title && <h2 className={cn("mb-0 text-2xl font-bold", titleClass)}>{title}</h2>}

			<div className="flex flex-1 flex-col">
				{image}

				{description && <div className="whitespace-pre-line text-theme-secondary-text">{description}</div>}

				{children}
			</div>
		</div>
	</div>
);

export { ModalContainer, ModalContent };
