import cn from "classnames";
import React, { useEffect } from "react";

import { Input } from "@/app/components/Input";

type TextareaProperties = {
	isInvalid?: boolean;
	palceholder?: string;
	initialHeight?: number;
} & React.TextareaHTMLAttributes<any>;

export const TextArea = React.forwardRef(
	({ initialHeight = 100, ...properties }: TextareaProperties, reference: any) => {
		useEffect(() => {
			const current = reference?.current;
			if (current) {
				current.style.height = `${initialHeight}px`;
				// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
				current.style.height = `${current.scrollHeight + 4}px`;
			}
		}, [reference, properties.value, initialHeight]);

		return (
			<div className="relative">
				<div className="pointer-events-none absolute bottom-4 right-3 z-10 hidden h-0 w-0 -rotate-45 border-x-8 border-t-8 border-x-transparent border-t-theme-secondary-400 dark:border-t-theme-secondary-700 md:block" />

				<Input
					data-testid="TextArea"
					as="textarea"
					isTextArea
					ref={reference}
					{...properties}
					innerClassName={cn("resize-none min-h-[8rem] md:min-h-auto md:resize-y", {
						"resize-none": properties.disabled,
					})}
				/>
			</div>
		);
	},
);

TextArea.displayName = "TextArea";
