import cn from "classnames";
import React, { useEffect, useRef, JSX } from "react";

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
	ref?: React.Ref<HTMLInputElement>;
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
			"text-theme-text flex w-full appearance-none items-center space-x-2 rounded px-4 transition-colors duration-200",
			cn({
				border: !noBorder,
				"border-theme-danger-500 bg-theme-background focus-within:ring-theme-danger-500": invalid && !disabled,
				"border-theme-danger-500 bg-theme-secondary-100 dark:bg-theme-secondary-800": disabled && invalid,
				"border-theme-primary-600 bg-theme-background focus-within:border-theme-primary-600 focus-within:ring-theme-primary-600":
					valid && !disabled && !invalid,
				"border-theme-secondary-300 bg-theme-secondary-100 dark:border-theme-secondary-700 dark:bg-theme-secondary-800 dim:border-theme-dim-700 dim:bg-theme-dim-950":
					disabled && !invalid,
				"border-theme-secondary-400 bg-theme-background focus-within:border-theme-primary-600 focus-within:ring-theme-primary-600 dark:border-theme-secondary-700 dim:border-theme-dim-500":
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

interface InputStyledProps {
	as?: React.ElementType;
	ref?: React.Ref<HTMLInputElement>;
}

const InputStyled = ({
	as: Component = "input",
	...properties
}: InputStyledProps & React.ComponentPropsWithRef<"input">) => (
	<Component
		{...properties}
		className={twMerge(
			"bg-transparent! p-0! focus:shadow-none focus:ring-transparent! focus:outline-hidden [&.shadow-none]:shadow-none",
			properties.className,
		)}
	/>
);

InputStyled.displayName = "InputStyled";

type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export const Input = ({
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
	readOnly,
	autoComplete = "off",
	ref,
	type,
	...properties
}: InputProperties) => {
	let fieldContext = useFormField();

	if (ignoreContext) {
		fieldContext = undefined;
	}

	const isInvalidValue = fieldContext?.isInvalid || isInvalid;
	const errorMessageValue = fieldContext?.errorMessage || errorMessage;

	const focusReference = useRef<InputElement>(null);

	const inputReference = isFocused ? focusReference : ref;

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
							"no-ligatures placeholder:text-theme-secondary-400 dark:placeholder:text-theme-secondary-700 dim:placeholder:text-theme-dim-500 w-full border-none text-sm! sm:text-base!",
							{
								"text-theme-secondary-text": disabled,
							},
							innerClassName,
						)}
						name={fieldContext?.name}
						aria-invalid={isInvalidValue}
						disabled={disabled}
						value={value}
						type={type ?? "text"}
						// @ts-ignore
						ref={inputReference}
						readOnly={readOnly}
						autoComplete={autoComplete}
						{...properties}
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
							"divide-theme-secondary-300 dark:divide-theme-secondary-800 dim:divide-theme-dim-700 flex items-center divide-x",
							{
								"absolute right-0 bottom-full mb-2": isTextArea,
								"text-theme-danger-500": isInvalidValue,
								"text-theme-primary-300 dark:text-theme-secondary-600": !isInvalidValue,
							},
							addons?.end?.wrapperClassName,
						)}
					>
						{isInvalidValue && (
							<div className={cn({ "pr-3": addons?.end })}>
								<Tooltip content={errorMessageValue} size="sm">
									<span data-errortext={errorMessageValue} data-testid="Input__error">
										<Icon
											name="CircleExclamationMark"
											className={cn("text-theme-danger-500")}
											size="lg"
										/>
									</span>
								</Tooltip>
							</div>
						)}

						{isValid && (
							<Icon
								data-testid="Input__valid"
								name="CircleCheckMark"
								size="lg"
								className={cn("text-theme-primary-600 pointer-events-none focus:outline-hidden", {
									"pr-3": addons?.end,
								})}
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
};

Input.displayName = "Input";
