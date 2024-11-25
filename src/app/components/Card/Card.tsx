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
		className={twMerge(
			"relative h-full w-full cursor-pointer rounded-lg border-2 border-theme-primary-100 bg-theme-background p-5 text-left outline-none transition-colors-shadow duration-200 focus-visible:border-theme-primary-400 focus-visible:outline-none dark:border-theme-secondary-800",
			cn({
				"hover:border-theme-primary-100 hover:bg-theme-primary-100 hover:shadow-xl hover:dark:border-theme-secondary-800 hover:dark:bg-theme-secondary-800":
					typeof onClick === "function" && variant === "primary",
				"hover:border-theme-primary-700 hover:bg-theme-primary-700 hover:text-white hover:shadow-xl":
					typeof onClick === "function" && variant === "secondary",
			}),
			props.className,
		)}
		{...props}
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
			<div className="absolute -right-1 -top-1 m-4 flex items-center space-x-1">
				{addonIcons}
				{actions && actions.length > 0 && (
					<Dropdown
						placement="bottom"
						options={actions}
						onSelect={onSelect}
						toggleContent={
							<div className="flex w-4 justify-center overflow-hidden">
								<Icon
									name="EllipsisVertical"
									className="cursor-pointer p-1 text-theme-primary-300 transition-colors duration-200 hover:text-theme-primary-400 dark:text-theme-secondary-600 dark:hover:text-theme-secondary-200"
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
