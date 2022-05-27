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
							className="ring-focus relative flex h-full w-full items-center justify-center text-2xl focus:outline-none"
							data-ring-focus-margin="-m-1"
						>
							<Icon name={show ? "EyeSlash" : "Eye"} size="lg" />
						</button>
					),
				},
			}}
			{...properties}
		/>
	);
});

InputPassword.displayName = "InputPassword";
