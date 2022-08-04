import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Button } from "@/app/components/Button";
import { useActiveProfile, useAccordion } from "@/app/hooks";
import { WalletsGroupProperties } from "@/domains/wallet/components/WalletsGroup/WalletsGroup.contracts";
import { WalletsGroupHeader } from "@/domains/wallet/components/WalletsGroup/WalletsGroupHeader";
import { WalletsList } from "@/domains/wallet/components/WalletsList";
import { AccordionWrapper } from "@/app/components/Accordion";
import { useConfiguration } from "@/app/contexts";

const MAX_WALLETS_ON_DASHBOARD_LIST = 10;

export const WalletsGroup: React.VFC<WalletsGroupProperties> = ({ network, wallets, maxWidthReferences }) => {
	const { t } = useTranslation();
	const history = useHistory();
	const profile = useActiveProfile();
	const { isExpanded, handleHeaderClick } = useAccordion();

	const { profileIsSyncingExchangeRates } = useConfiguration();

	const goToCoinWallets = useCallback(() => {
		history.push(`/profiles/${profile.id()}/network/${network.id()}`);
	}, [history, network, profile]);

	return (
		<AccordionWrapper data-testid="WalletsGroup" isCollapsed={!isExpanded}>
			<WalletsGroupHeader
				network={network}
				wallets={wallets}
				maxWidthReferences={maxWidthReferences}
				isExpanded={isExpanded}
				isSyncing={profileIsSyncingExchangeRates}
				onClick={handleHeaderClick}
			/>

			{isExpanded && (
				<WalletsList wallets={wallets} itemsPerPage={MAX_WALLETS_ON_DASHBOARD_LIST} showPagination={false} />
			)}

			{isExpanded && wallets.length > MAX_WALLETS_ON_DASHBOARD_LIST && (
				<Button
					variant="secondary"
					className="mx-4 mt-1 mb-4"
					data-testid="WalletsList__ShowAll"
					onClick={goToCoinWallets}
				>
					{`${t("COMMON.SHOW_ALL")} (${wallets.length})`}
				</Button>
			)}
		</AccordionWrapper>
	);
};
