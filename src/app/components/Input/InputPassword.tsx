import React from "react";

import { Input } from "./Input";
import { Icon } from "@/app/components/Icon";

type InputPasswordProperties = {
	isInvalid?: boolean;
	preventAutofill?: boolean;
	ref?: React.Ref<HTMLInputElement>;
} & React.InputHTMLAttributes<any>;

export const InputPassword = (properties: InputPasswordProperties) => {
	const [show, setShow] = React.useState(false);
	const togglePasswordVisibility = () => setShow(!show);

	return (
		<Input
			data-testid="InputPassword"
			type={show ? "text" : "password"}
			autoComplete="new-password"
			addons={{
				end: {
					content: (
						<button
							data-testid="InputPassword__toggle"
							type="button"
							onClick={togglePasswordVisibility}
							className="ring-focus relative flex h-full w-full items-center justify-center text-2xl focus:outline-hidden"
							data-ring-focus-margin="-m-1"
						>
							<Icon
								name={show ? "EyeSlash" : "Eye"}
								size="lg"
								className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200"
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
