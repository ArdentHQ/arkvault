import React from "react";
import { styled } from "twin.macro";
import { getStyles } from "./Logo.styles";
import { images } from "@/app/assets/images";

const { PayvoLogo } = images.common;

const BetaWrapper = styled.div(getStyles);

export const Logo = ({ height }: { height?: number }) => (
	<span className="relative">
		<BetaWrapper className="absolute -top-4 -right-7 rounded-md border-2 border-white bg-theme-secondary-800 px-0.5 font-bold text-white dark:border-theme-secondary-900">
			BETA
		</BetaWrapper>
		<PayvoLogo height={height} />
	</span>
);

Logo.displayName = "Logo";
