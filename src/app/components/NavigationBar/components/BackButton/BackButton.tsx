import React from "react";
import { useHistory } from "react-router-dom";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";
import cn from 'classnames';

interface BackButtonProperties {
	backToUrl?: string;
	disabled?: boolean;
}

const StyledBackButton = ({disabled, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement> & BackButtonProperties) => (
		<button
			{...props}
			className={twMerge("flex items-center w-12 transition-colors duration-200 bg-theme-secondary-100 dark:bg-black", cn({
				"text-theme-primary-600 dark:text-theme-secondary-200 hover:bg-theme-primary-100 hover:dark:bg-theme-secondary-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-theme-primary-400 focus:rounded": !disabled,
				"text-theme-secondary-500 dark:text-theme-secondary-800 cursor-not-allowed": disabled,
			}), props.className)}
		>
			<Icon name="ChevronLeftSmall" className="mx-auto" size="sm" />
		</button>
	)

export const BackButton = ({ backToUrl, disabled }: BackButtonProperties) => {
	const history = useHistory();

	const handleOnClick = () => {
		if (backToUrl) {
			return history.push(backToUrl);
		}

		history.go(-1);
	};

	return (
		<StyledBackButton onClick={handleOnClick} disabled={disabled}>
			<Icon name="ChevronLeftSmall" className="mx-auto" size="sm" />
		</StyledBackButton>
	);
};
