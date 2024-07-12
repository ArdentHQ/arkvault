import React from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "twin.macro";

import { getStyles } from "./BackButton.styles";
import { Icon } from "@/app/components/Icon";

interface BackButtonProperties {
	backToUrl?: string;
	disabled?: boolean;
}

const StyledBackButton = styled.button<BackButtonProperties>(getStyles);

export const BackButton = ({ backToUrl, disabled }: BackButtonProperties) => {
	const navigate = useNavigate();

	const handleOnClick = () => {
		if (backToUrl) {
			return navigate(backToUrl);
		}

		navigate(-1);
	};

	return (
		<StyledBackButton onClick={handleOnClick} disabled={disabled}>
			<Icon name="ChevronLeftSmall" className="mx-auto" size="sm" />
		</StyledBackButton>
	);
};
