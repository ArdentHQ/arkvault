import React from "react";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { ButtonVariant } from "@/types";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

interface CardProperties {
	as?: React.ElementType;
	variant?: ButtonVariant;
	children: React.ReactNode;
	addonIcons?: React.ReactNode;
	actions?: DropdownOption[];
	onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	onSelect?: (option: DropdownOption) => void;
	className?: string;
}

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	onClick?: any;
}

const StyledButton = ({ variant, onClick, ...props }: StyledButtonProps) => (
	<button
		{...props}
		onClick={onClick}
		className={twMerge(
			"border-theme-primary-100 bg-theme-background transition-colors-shadow focus-visible:border-theme-primary-400 dark:border-theme-secondary-800 relative h-full w-full cursor-pointer rounded-lg border-2 p-5 text-left outline-hidden duration-200 focus-visible:outline-hidden",
			cn({
				"hover:border-theme-primary-100 hover:bg-theme-primary-100 dark:hover:border-theme-secondary-800 dark:hover:bg-theme-secondary-800 hover:shadow-xl":
					typeof onClick === "function" && variant === "primary",
				"hover:border-theme-primary-700 hover:bg-theme-primary-700 hover:text-white hover:shadow-xl":
					typeof onClick === "function" && variant === "secondary",
			}),
			props.className,
		)}
	/>
);

export const Card = ({ variant, children, addonIcons, actions, onClick, onSelect, className }: CardProperties) => (
	<div className={className}>
		<StyledButton
			type="button"
			variant={variant}
			onClick={onClick}
			data-testid="Card"
			tabIndex={onClick ? undefined : -1}
		>
			{children}
			<div className="flex absolute -top-1 -right-1 items-center m-4 space-x-1">
				{addonIcons}
				{actions && actions.length > 0 && (
					<Dropdown
						placement="bottom"
						options={actions}
						onSelect={onSelect}
						toggleContent={
							<div className="flex overflow-hidden justify-center w-4">
								<Icon
									name="EllipsisVertical"
									className="p-1 transition-colors duration-200 cursor-pointer text-theme-primary-300 dark:text-theme-secondary-600 dark:hover:text-theme-secondary-200 hover:text-theme-primary-400"
									size="md"
								/>
							</div>
						}
					/>
				)}
			</div>
		</StyledButton>
	</div>
);
