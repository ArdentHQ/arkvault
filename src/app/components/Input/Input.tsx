import cn from "classnames";
import React, { forwardRef, useEffect, useRef } from "react";

import { InputSuggestion } from "./InputSuggestion";
import { useFormField } from "@/app/components/Form/useFormField";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { twMerge } from "tailwind-merge";

interface AddonProperties {
	wrapperClassName?: string;
	content: JSX.Element;
}

type InputProperties = {
	addons?: {
		start?: AddonProperties;
		end?: AddonProperties;
	};
	as?: React.ElementType;
	errorMessage?: string;
	hideInputValue?: boolean;
	ignoreContext?: boolean;
	innerClassName?: string;
	isFocused?: boolean;
	isInvalid?: boolean;
	isValid?: boolean;
	isTextArea?: boolean;
	isCompact?: boolean;
	noBorder?: boolean;
	noShadow?: boolean;
	suggestion?: string;
} & React.HTMLProps<any>;

export const InputWrapperStyled = ({
	noBorder,
	noShadow,
	valid,
	invalid,
	disabled,
	isTextArea,
	isCompact,
	...props
}: React.HTMLProps<HTMLDivElement> & {
	disabled?: boolean;
	invalid?: boolean;
	valid?: boolean;
	isTextArea?: boolean;
	isCompact?: boolean;
	noBorder?: boolean;
	noShadow?: boolean;
}) => (
	<div
		{...props}
		className={twMerge(
			"flex w-full appearance-none items-center space-x-2 rounded px-4 text-theme-text transition-colors duration-200",
			cn({
				border: !noBorder,
				"border-theme-danger-500 bg-theme-background focus-within:ring-theme-danger-500": invalid && !disabled,
				"border-theme-danger-500 bg-theme-secondary-100 dark:bg-theme-secondary-800": disabled && invalid,
				"border-theme-primary-600 bg-theme-background focus-within:border-theme-primary-600 focus-within:ring-theme-primary-600":
					valid && !disabled && !invalid,
				"border-theme-secondary-300 bg-theme-secondary-100 dark:border-theme-secondary-700 dark:bg-theme-secondary-800":
					disabled && !invalid,
				"border-theme-secondary-400 bg-theme-background focus-within:border-theme-primary-600 focus-within:ring-theme-primary-600 dark:border-theme-secondary-700":
					!valid && !invalid && !disabled,
				"focus-within:ring-1": !noShadow,
				"h-12 overflow-hidden sm:h-14": !isTextArea && !isCompact,
				"h-[34px] overflow-hidden": !isTextArea && isCompact,
				relative: isTextArea,
			}),
			props.className,
		)}
	/>
);

interface InputStyledProps extends React.InputHTMLAttributes<HTMLInputElement> {
	autocomplete?: string;
}

const InputStyled = forwardRef<HTMLInputElement, InputStyledProps>(({ autocomplete = "off", ...props }, ref) => (
	<input
		{...props}
		ref={ref}
		autoComplete={autocomplete}
		className={twMerge(
			"!bg-transparent !p-0 focus:shadow-none focus:outline-none focus:!ring-0 focus:!ring-transparent [&.shadow-none]:shadow-none",
			props.className,
		)}
	/>
));

InputStyled.displayName = "InputStyled";

type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export const Input = React.forwardRef<InputElement, InputProperties>(
	(
		{
			addons,
			className,
			disabled,
			errorMessage,
			hideInputValue,
			ignoreContext,
			innerClassName,
			isFocused,
			isInvalid,
			isValid,
			isTextArea,
			isCompact,
			noBorder,
			noShadow,
			style,
			suggestion,
			value,
			...properties
		}: InputProperties,
		reference,
	) => {
		let fieldContext = useFormField();

		if (ignoreContext) {
			fieldContext = undefined;
		}

		const isInvalidValue = fieldContext?.isInvalid || isInvalid;
		const errorMessageValue = fieldContext?.errorMessage || errorMessage;

		const focusReference = useRef<InputElement>(null);

		reference = isFocused ? focusReference : reference;

		useEffect(() => {
			if (isFocused && focusReference.current) {
				focusReference.current.focus();
			}
		}, [focusReference, isFocused]);

		const hiddenReference = useRef<HTMLDivElement>(null);

		return (
			<>
				{suggestion && (
					<div ref={hiddenReference} className="invisible fixed w-auto whitespace-nowrap">
						{value}…
					</div>
				)}

				<InputWrapperStyled
					style={style}
					className={className}
					disabled={disabled}
					invalid={isInvalidValue}
					valid={isValid}
					noBorder={noBorder}
					noShadow={noShadow}
					isTextArea={isTextArea}
					isCompact={isCompact}
				>
					{addons?.start !== undefined && addons.start.content}
					<div className={cn("relative flex h-full flex-1", { invisible: hideInputValue })}>
						<InputStyled
							data-testid="Input"
							className={cn(
								"no-ligatures w-full border-none !text-sm placeholder:text-theme-secondary-400 dark:placeholder:text-theme-secondary-700 sm:!text-base",
								innerClassName,
								{
									"text-theme-secondary-text": disabled,
								},
							)}
							name={fieldContext?.name}
							aria-invalid={isInvalidValue}
							disabled={disabled}
							value={value}
							type="text"
							// @ts-ignore
							ref={reference}
							{...properties}
							autoComplete="off"
						/>

						<InputSuggestion
							suggestion={suggestion}
							hiddenReference={hiddenReference}
							innerClassName={innerClassName}
						/>
					</div>

					{(isInvalidValue || isValid || addons?.end) && (
						<div
							data-testid="Input__addon-end"
							className={cn(
								"flex items-center space-x-3 divide-x divide-theme-secondary-300 dark:divide-theme-secondary-800",
								{
									"absolute bottom-full right-0 mb-2": isTextArea,
									"text-theme-danger-500": isInvalidValue,
									"text-theme-primary-300 dark:text-theme-secondary-600": !isInvalidValue,
								},
								addons?.end?.wrapperClassName,
							)}
						>
							{isInvalidValue && (
								<Tooltip content={errorMessageValue} size="sm">
									<span data-errortext={errorMessageValue} data-testid="Input__error">
										<Icon
											name="CircleExclamationMark"
											className="text-theme-danger-500"
											size="lg"
										/>
									</span>
								</Tooltip>
							)}

							{isValid && (
								<Icon
									data-testid="Input__valid"
									name="CircleCheckMark"
									size="lg"
									className="pointer-events-none text-theme-primary-600 focus:outline-none"
								/>
							)}

							{addons?.end && (
								<div className={cn({ "pl-3": isInvalidValue && !addons.end.wrapperClassName })}>
									{addons.end.content}
								</div>
							)}
						</div>
					)}
				</InputWrapperStyled>
			</>
		);
	},
);

Input.displayName = "Input";
