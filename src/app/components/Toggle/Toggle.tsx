import React from "react";
import tw, { css, styled } from "twin.macro";

const Wrapper = styled.label<{ disabled?: boolean; small?: boolean }>`
	${tw`flex items-center`}

	${({ disabled }) => (disabled ? tw`cursor-not-allowed` : tw`cursor-pointer`)}

	${({ small }) => (small ? tw`h-3` : tw`h-4`)}
`;

const Input = styled("input", { target: "toggle-input" })`
	${tw`sr-only`}
`;

const Handle = styled("div", { target: "toggle-handle" })<{ small?: boolean }>`
	${tw`inline-flex [height:5px] rounded-full relative bg-theme-primary-100 dark:bg-theme-secondary-800`}

	${({ small }) => (small ? tw`w-6` : tw`[width:30px]`)}
`;

const HandleInner = styled.span<{ alwaysOn?: boolean; disabled?: boolean; small?: boolean }>`
	${tw`absolute rounded-full top-1/2 -translate-y-1/2 transition transition-colors transition-transform ease-in-out duration-200`}

	${({ alwaysOn, disabled }) =>
		disabled
			? tw`bg-theme-primary-100 dark:bg-theme-secondary-800`
			: css`
					${alwaysOn ? tw`bg-theme-primary-600` : tw`bg-theme-secondary-400 dark:bg-theme-secondary-600`}

					${Input}:checked ~ ${Handle} & {
						${tw`translate-x-full bg-theme-primary-600`}
					}

					${Input}:hover ~ ${Handle} & {
						${tw`shadow-outline`}
					}

					${Input}:focus ~ ${Handle} & {
						${tw`shadow-outline`}
					}
				`}

	${({ small }) => (small ? tw`w-3 h-3` : tw`w-4 h-4`)}
`;

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
