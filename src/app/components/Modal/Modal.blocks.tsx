import cn from "classnames";
import React, { JSX } from "react";
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

interface ModalContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: Size;
	ref?: React.Ref<HTMLDivElement>;
}

const ModalContainer = ({ size, ...props }: ModalContainerProps) => (
	<div
		{...props}
		className={twMerge(
			"max-w-full flex-1 md:m-auto md:max-w-2xl md:px-10",
			cn({
				"md:max-w-3xl": size === "3xl",
				"md:max-w-4xl": size === "4xl",
				"md:max-w-5xl": size === "5xl",
				"md:max-w-lg": size === "lg",
				"md:max-w-md": size === "md",
				"md:max-w-sm": size === "sm",
				"md:max-w-xl": size === "xl",
			}),
			props.className,
		)}
	/>
);

ModalContainer.displayName = "ModalContainer";

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
			"bg-theme-background dark:border-theme-dark-700 dim:border dim:border-theme-dim-800 relative flex min-h-full flex-col overflow-hidden shadow-2xl sm:mb-0 md:h-auto md:rounded-xl dark:border",
			noButtons && "pb-24 sm:pb-0",
			className,
		)}
		data-testid="Modal__inner"
	>
		{!hideCloseButton && (
			<div className="text-theme-secondary-700 hover:text-theme-navy-700 hover:bg-theme-navy-200 dark:text-theme-secondary-200 dark:hover:text-theme-dark-50 dark:hover:bg-theme-dark-700 dim:text-theme-dim-200 dim:hover:text-theme-dim-50 dim:hover:bg-theme-dim-700 absolute top-0 right-0 z-10 mt-3.5 mr-6 rounded transition-all duration-100 ease-linear md:mt-3.5 md:mr-6">
				<Button
					data-testid="Modal__close-button"
					variant="transparent"
					size="icon"
					onClick={onClose}
					className="h-5 w-5"
				>
					<Icon name="Cross" />
				</Button>
			</div>
		)}

		<div className="relative flex flex-1 flex-col">
			<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 border-b px-6 py-3.5">
				{banner && (
					<div className="relative -mx-10 -mt-10 mb-10 h-56">
						{banner}

						<div className="absolute bottom-0 left-0 mb-10 ml-10">
							<h2
								className={`m-0 text-4xl leading-tight font-extrabold ${titleClass || "text-theme-text"}`}
							>
								{title}
							</h2>
						</div>
					</div>
				)}

				{!banner && title && (
					<h2
						className={cn(
							"mb-0 max-w-[calc(100%_-_32px)] text-lg leading-5 font-semibold md:pt-0 md:text-lg",
							titleClass,
						)}
					>
						{title}
					</h2>
				)}
			</div>

			<div className="flex flex-1 flex-col px-6 pt-4 sm:pb-4">
				{image}

				{description && (
					<div className="text-theme-secondary-text pr-10 text-sm whitespace-pre-line md:pr-0 md:text-base">
						{description}
					</div>
				)}

				{children}
			</div>
		</div>
	</div>
);

export { ModalContainer, ModalContent };
