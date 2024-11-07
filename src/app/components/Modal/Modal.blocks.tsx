import cn from "classnames";
import tw, { styled } from "twin.macro";
import React from "react";
import { DefaultTReturn, TOptions } from "i18next";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Size } from "@/types";
import { twMerge } from "tailwind-merge";

interface ModalContentProperties {
	children: React.ReactNode;
	title: string | React.ReactNode;
	titleClass?: string;
	description?: string | JSX.Element | DefaultTReturn<TOptions>;
	banner?: React.ReactNode;
	image?: React.ReactNode;
	onClose?: any;
	hideCloseButton?: boolean;
	noButtons?: boolean;
	className?: string;
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
	className,
}: ModalContentProperties) => (
	<div
		className={twMerge(
			"relative flex min-h-full flex-col overflow-hidden bg-theme-background shadow-2xl sm:mb-0 md:h-auto md:rounded-xl",
			"px-6 pt-4 md:p-8",
			noButtons && "pb-24",
			className,
		)}
		data-testid="Modal__inner"
	>
		{!hideCloseButton && (
			<div className="absolute right-0 top-0 z-10 mr-6 mt-4 rounded bg-theme-primary-100 transition-all duration-100 ease-linear hover:bg-theme-primary-800 hover:text-white green:hover:bg-theme-primary-700 dark:bg-theme-secondary-800 dark:text-theme-secondary-200 dark:hover:bg-theme-primary-500 dark:hover:text-white md:mr-8 md:mt-8">
				<Button
					data-testid="Modal__close-button"
					variant="transparent"
					size="icon"
					onClick={onClose}
					className="h-8 w-8"
				>
					<Icon name="Cross" />
				</Button>
			</div>
		)}

		<div className="relative flex flex-1 flex-col space-y-1.5">
			{banner && (
				<div className="relative -mx-10 -mt-10 mb-10 h-56">
					{banner}

					<div className="absolute bottom-0 left-0 mb-10 ml-10">
						<h2 className={`m-0 text-4xl font-extrabold leading-tight ${titleClass || "text-theme-text"}`}>
							{title}
						</h2>
					</div>
				</div>
			)}

			{!banner && title && (
				<h2 className={cn("mb-0 max-w-[calc(100%_-_32px)] text-lg font-bold md:pt-0 md:text-2xl", titleClass)}>
					{title}
				</h2>
			)}

			<div className="flex flex-1 flex-col">
				{image}

				{description && (
					<div className="whitespace-pre-line pr-10 text-sm text-theme-secondary-text md:pr-0 md:text-base">
						{description}
					</div>
				)}

				{children}
			</div>
		</div>
	</div>
);

export { ModalContainer, ModalContent };
