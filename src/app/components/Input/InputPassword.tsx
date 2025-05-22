import React from "react";

import { Input } from "./Input";
import { Icon } from "@/app/components/Icon";

type InputPasswordProperties = { isInvalid?: boolean } & React.InputHTMLAttributes<any>;

export const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProperties>((properties, reference) => {
	const [show, setShow] = React.useState(false);
	const togglePasswordVisibility = () => setShow(!show);

	return (
		<Input
			data-testid="InputPassword"
			ref={reference}
			type={show ? "text" : "password"}
			autoComplete="new-password"
			addons={{
				end: {
					content: (
						<button
							data-testid="InputPassword__toggle"
							type="button"
							onClick={togglePasswordVisibility}
							className="flex relative justify-center items-center w-full h-full text-2xl ring-focus focus:outline-hidden"
							data-ring-focus-margin="-m-1"
						>
							<Icon
								name={show ? "EyeSlash" : "Eye"}
								size="lg"
								className="text-theme-secondary-700 dark:text-theme-dark-200"
							/>
						</button>
					),
				},
			}}
			{...properties}
		/>
	);
});

InputPassword.displayName = "InputPassword";
