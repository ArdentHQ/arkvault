import tw, { css, styled } from "twin.macro";

const baseStyles = css`
	max-height: 30rem;
	${tw`p-10 space-y-4 overflow-y-auto overscroll-y-none`};
`;

export const NotificationsWrapper = styled.div<{ wider?: boolean }>`
	${baseStyles}

	${({ wider }) =>
		wider &&
		css`
			width: 35rem;
		`}
`;
