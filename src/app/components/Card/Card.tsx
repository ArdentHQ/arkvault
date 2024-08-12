import React from "react";

import { styled } from "twin.macro";
import { getStyles } from "./Card.styles";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { ButtonVariant } from "@/types";

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

const StyledButton = styled.button<{ variant?: ButtonVariant; onClick?: any }>(getStyles);

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
						position="top-right"
						options={actions}
						onSelect={onSelect}
						toggleContent={
							<div className="flex w-4 justify-center overflow-hidden">
								<Icon
									name="EllipsisVertical"
									className="cursor-pointer p-1 text-theme-primary-300 transition-colors duration-200 hover:text-theme-primary-400 dark:text-theme-secondary-600 dark:hover:text-theme-secondary-200"
									size="lg"
								/>
							</div>
						}
					/>
				)}
			</div>
		</StyledButton>
	</div>
);
