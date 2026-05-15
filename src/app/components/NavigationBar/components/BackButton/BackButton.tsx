import React from "react";
import { useNavigate } from "react-router-dom";
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
			"flex w-9 items-center border-b border-b-theme-secondary-300 bg-theme-secondary-100 transition-colors duration-200 dim:border-b-theme-dim-700 dim:bg-theme-dim-950 dark:border-b-theme-dark-700 dark:bg-theme-dark-950",
			cn({
				"cursor-not-allowed text-theme-secondary-500 dark:text-theme-secondary-800": disabled,
				"focus:outline-hidden cursor-pointer text-theme-secondary-500 hover:bg-theme-primary-200 hover:text-theme-primary-700 focus:rounded focus:ring-2 focus:ring-inset focus:ring-theme-primary-400 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-500 dark:text-theme-dark-50 dark:hover:bg-theme-dark-700":
					!disabled,
			}),
			props.className,
		)}
	>
		<Icon name="ChevronLeftSmall" className="mx-auto" size="sm" />
	</button>
);

export const BackButton = ({ backToUrl, disabled }: BackButtonProperties) => {
	const navigate = useNavigate();

	const handleOnClick = () => {
		if (backToUrl) {
			return navigate(backToUrl);
		}

		navigate(-1);
	};

	return (
		<StyledBackButton onClick={handleOnClick} disabled={disabled}>
			<Icon name="ChevronLeftSmall" className="mx-auto" size="sm" />
		</StyledBackButton>
	);
};
