import React from "react";
import { useHistory } from "react-router-dom";
import { styled } from "twin.macro";

import { Icon } from "@/app/components/Icon";

import { getStyles } from "./BackButton.styles";

interface BackButtonProperties {
	backToUrl?: string;
	disabled?: boolean;
}

const StyledBackButton = styled.button<BackButtonProperties>(getStyles);

export const BackButton = ({ backToUrl, disabled }: BackButtonProperties) => {
	const history = useHistory();

	const handleOnClick = () => {
		if (backToUrl) {
			return history.push(backToUrl);
		}

		history.go(-1);
	};

	return (
		<StyledBackButton onClick={handleOnClick} disabled={disabled}>
			<Icon name="ChevronLeftSmall" className="mx-auto" size="sm" />
		</StyledBackButton>
	);
};
