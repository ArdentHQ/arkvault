import React from "react";
import { useTranslation } from "react-i18next";
import tw, { styled } from "twin.macro";

import { OptionButton } from "./MnemonicVerificationOptions";
import { getOrdinalIndicator } from "./utils/evaluateOrdinalIndicator";
import { Icon } from "@/app/components/Icon";

const TabStyled = styled(OptionButton)<{ isActive: boolean; isComplete: boolean; isPending: boolean }>`
	${tw`flex flex-1 items-center justify-center pointer-events-none transition-colors duration-200`};
	${({ isActive }) =>
		isActive && tw`font-semibold bg-theme-primary-50 dark:bg-theme-primary-900 border-theme-primary-500`};
	${({ isComplete }) => isComplete && tw`border-transparent bg-theme-primary-100 dark:bg-theme-primary-600`};
	${({ isPending }) =>
		isPending && tw`border-theme-primary-100 dark:border-theme-secondary-800 text-theme-primary-600`};
`;

interface TabProperties {
	activeTab: number;
	tabId: number;
	wordPosition: number;
}

const Tab = ({ activeTab, tabId, wordPosition }: TabProperties) => {
	const { isActive, isComplete, isPending } = React.useMemo(
		() => ({
			isActive: activeTab === tabId,
			isComplete: activeTab > tabId,
			isPending: tabId > activeTab,
		}),
		[activeTab, tabId],
	);

	const { t } = useTranslation();

	return (
		<TabStyled
			disabled
			data-testid="MnemonicVerificationProgress__Tab"
			isActive={isActive}
			isComplete={isComplete}
			isPending={isPending}
		>
			{isComplete ? (
				<span className="text-lg text-theme-primary-600 dark:text-theme-secondary-200">
					<Icon name="CircleCheckMark" size="lg" />
				</span>
			) : (
				<>
					<span className="block sm:hidden">
						{wordPosition}
						{getOrdinalIndicator(wordPosition)}
					</span>

					<span className="hidden sm:block">
						{t("WALLETS.MNEMONIC_VERIFICATION.WORD_NUMBER", {
							ordinalIndicator: getOrdinalIndicator(wordPosition),
							position: wordPosition,
						})}
					</span>
				</>
			)}
		</TabStyled>
	);
};

interface Properties {
	activeTab: number;
	wordPositions: number[];
}

export const MnemonicVerificationProgress = ({ activeTab, wordPositions }: Properties) => (
	<ul className="flex space-x-3">
		{wordPositions.map((position, index) => (
			<Tab key={index} activeTab={activeTab} tabId={index} wordPosition={position} />
		))}
	</ul>
);
