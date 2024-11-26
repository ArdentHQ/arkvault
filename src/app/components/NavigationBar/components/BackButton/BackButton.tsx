import React from "react";
import { useHistory } from "react-router-dom";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

interface BackButtonProperties {
	backToUrl?: string;
	disabled?: boolean;
}

const StyledBackButton = ({
	disabled,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & BackButtonProperties) => (
	<button
		{...props}
		className={twMerge(
			"flex w-12 items-center bg-theme-secondary-100 transition-colors duration-200 dark:bg-black",
			cn({
				"cursor-not-allowed text-theme-secondary-500 dark:text-theme-secondary-800": disabled,
				"text-theme-primary-600 hover:bg-theme-primary-100 focus:rounded focus:outline-none focus:ring-2 focus:ring-inset focus:ring-theme-primary-400 dark:text-theme-secondary-200 hover:dark:bg-theme-secondary-800":
					!disabled,
			}),
			props.className,
		)}
	>
		<Icon name="ChevronLeftSmall" className="mx-auto" size="sm" />
	</button>
);

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
