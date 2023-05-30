import cn from "classnames";
import React from "react";
import tw, { css, styled } from "twin.macro";

const ControlButtonStyled = styled.button<{ noBorder?: boolean; disabled?: boolean }>`
	${tw`relative flex items-center justify-center py-2`}
	${tw`font-semibold text-theme-primary-300 dark:text-theme-secondary-600`}
	${tw`border-t-2 border-b-2 border-transparent`}
	${tw`transition-colors duration-200`}
	${tw`cursor-pointer`}
	${tw`focus:outline-none`}
	${tw`disabled:(cursor-not-allowed text-theme-secondary-400 dark:text-theme-secondary-700)`}

	${({ noBorder }) => {
		if (!noBorder) {
			return tw`px-2.5 mx-0.5`;
		}
	}}

	${({ disabled }) => {
		if (!disabled) {
			return css`
				&:hover {
					color: var(--theme-color-primary-400);
				}
			`;
		}
	}}

	${({ noBorder, disabled }) => {
		if (!noBorder && !disabled) {
			return css`
				&:hover {
					border-bottom-color: var(--theme-color-primary-400);
					color: var(--theme-color-primary-400);
				}
				&.active {
					&[data-focus-visible-added] {
						${tw`rounded`}
					}
					border-bottom-color: var(--theme-color-primary-600);
					color: var(--theme-color-primary-600);
				}
			`;
		}
	}}
`;

type ControlButtonProperties = {
	isChanged?: boolean;
	noBorder?: boolean;
} & React.ButtonHTMLAttributes<any>;

export const ControlButton = ({ isChanged, children, className, ...properties }: ControlButtonProperties) => (
	<div className="group">
		<ControlButtonStyled className={cn("ring-focus", className)} {...properties}>
			<>
				{isChanged && (
					<div
						className={cn(
							"absolute right-1 top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-theme-background transition-all duration-100 ease-linear",
							{ "-mr-2.5": properties.noBorder },
						)}
					>
						<div className="h-2 w-2 rounded-full bg-theme-primary-500" />
					</div>
				)}
				{children}
			</>
		</ControlButtonStyled>
	</div>
);
