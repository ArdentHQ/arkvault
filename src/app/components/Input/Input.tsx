import cn from "classnames";
import React, { useEffect, useRef } from "react";
import tw, { styled } from "twin.macro";

import { InputSuggestion } from "./InputSuggestion";
import { useFormField } from "@/app/components/Form/useFormField";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";

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

export const InputWrapperStyled = styled.div<{
	disabled?: boolean;
	invalid?: boolean;
	valid?: boolean;
	isTextArea?: boolean;
	isCompact?: boolean;
	noBorder?: boolean;
	noShadow?: boolean;
}>`
	${tw`flex items-center w-full px-4 space-x-2 transition-colors duration-200 rounded appearance-none text-theme-text`}

	${({ noBorder }) => {
		if (!noBorder) {
			return tw`border`;
		}
	}}

	${({ noShadow }) => {
		if (!noShadow) {
			return tw`focus-within:ring-1`;
		}
	}}

	${({ disabled, invalid, valid }) => {
		if (disabled && invalid) {
			return tw`border-theme-danger-500 bg-theme-secondary-100 dark:bg-theme-secondary-800`;
		}

		if (disabled) {
			return tw`border-theme-secondary-300 dark:border-theme-secondary-700 bg-theme-secondary-100 dark:bg-theme-secondary-800`;
		}

		if (invalid) {
			return tw`bg-theme-background border-theme-danger-500 focus-within:ring-theme-danger-500`;
		}

		if (valid) {
			return tw`bg-theme-background border-theme-primary-600 focus-within:(border-theme-primary-600 ring-theme-primary-600)`;
		}

		return tw`bg-theme-background border-theme-secondary-400 dark:border-theme-secondary-700 focus-within:(border-theme-primary-600 ring-theme-primary-600)`;
	}}

	${({ isTextArea, isCompact }) => {
		if (isTextArea) {
			return tw`relative`;
		}

		if (isCompact) {
			return tw`[height:34px] overflow-hidden`;
		}

		return tw`h-12 sm:h-14 overflow-hidden`;
	}}
`;

const InputStyled = styled.input`
	${tw`!bg-transparent !p-0`}

	&:focus {
		${tw`outline-none shadow-none (ring-0 ring-transparent)!`}
	}
	&.shadow-none {
		${tw`shadow-none`}
	}
`;

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
								"no-ligatures w-full border-none text-theme-secondary-400 dark:placeholder:text-theme-secondary-700",
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
