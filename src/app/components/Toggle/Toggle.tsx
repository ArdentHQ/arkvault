import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import cn from 'classnames';

interface WrapperProperties extends React.HTMLAttributes<HTMLLabelElement> {
	disabled?: boolean;
	small?: boolean;
}

interface HandleProperties extends React.HTMLAttributes<HTMLDivElement> {
	small?: boolean;
}

interface HandleInnerProperties extends React.HTMLAttributes<HTMLSpanElement> {
	alwaysOn?: boolean;
	disabled?: boolean;
	small?: boolean;
}

const Wrapper = ({ disabled, small, onClick, ...properties }: WrapperProperties) => {
	return <label {...properties} className={twMerge("flex items-center", cn(
		{ "cursor-not-allowed": disabled,
			"cursor-pointer": !disabled,
			"h-3": small,
			"h-4": !small,
		 },
	))} />;
}

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
    return <input {...props} ref={ref} className={twMerge("sr-only toggle-input", props.className)} />;
});

Input.displayName = "Input";

const Handle = ({ small, ...properties }: HandleProperties) => {
	return <div {...properties} className={twMerge("inline-flex h-[5px] rounded-full relative bg-theme-primary-100 dark:bg-theme-secondary-800 toggle-handle", cn({ "w-6": small, "w-[30px]": !small }))} />;
}

const HandleInner = ({ alwaysOn, disabled, small, ...properties }: HandleInnerProperties) => {
	return <span {...properties} className={twMerge("absolute rounded-full top-1/2 -translate-y-1/2 transition-all ease-in-out duration-200", cn(
		{
			"bg-theme-primary-100 dark:bg-theme-secondary-800": disabled,
			"handle-inner": !disabled,
			"bg-theme-primary-600": !disabled && alwaysOn,
			"bg-theme-secondary-400 dark:bg-theme-secondary-600": !disabled && !alwaysOn,
			"w-3 h-3": small,
			"w-4 h-4": !small,
		}
	))} />;
}

type ToggleProperties = { alwaysOn?: boolean; disabled?: boolean; small?: boolean } & React.InputHTMLAttributes<any>;

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProperties>(
	({ alwaysOn, disabled, small, onClick, ...properties }: ToggleProperties, reference) => (
		<Wrapper disabled={disabled} small={small} onClick={onClick}>
			<Input type="checkbox" disabled={disabled} ref={reference} {...properties} />
			<Handle small={small}>
				<HandleInner alwaysOn={alwaysOn} disabled={disabled} small={small} />
			</Handle>
		</Wrapper>
	),
);

Toggle.displayName = "Toggle";
