import React from "react";

import { Input } from "./Input";
import { Icon } from "@/app/components/Icon";

type InputPasswordProperties = {
	isInvalid?: boolean;
	ref?: React.Ref<HTMLInputElement>;
	errorMessage?: string;
} & React.InputHTMLAttributes<any>;

export const InputPassword = (properties: InputPasswordProperties) => {
	const [show, setShow] = React.useState(false);
	const togglePasswordVisibility = () => setShow(!show);

	return (
		<Input
			data-testid="InputPassword"
			type={show ? "text" : "password"}
			autoComplete="new-password"
			errorMessage={properties.errorMessage}
			addons={{
				end: {
					content: (
						<button
							data-testid="InputPassword__toggle"
							type="button"
							onClick={togglePasswordVisibility}
							className="ring-focus focus:outline-hidden relative flex h-full w-full items-center justify-center text-2xl"
							data-ring-focus-margin="-m-1"
						>
							<Icon
								name={show ? "EyeSlash" : "Eye"}
								size="lg"
								className="text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200"
							/>
						</button>
					),
				},
			}}
			{...properties}
		/>
	);
};

InputPassword.displayName = "InputPassword";
