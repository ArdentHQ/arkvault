import React from "react";
import { WalletsGroupProperties } from "@/domains/wallet/components/WalletsGroup/WalletsGroup.contracts";
import { WalletsGroupHeader } from "@/domains/wallet/components/WalletsGroup/WalletsGroupHeader";
import { WalletsList } from "@/domains/wallet/components/WalletsList";
import { AccordionWrapper } from "@/app/components/Accordion";
import { useAccordion } from "@/app/hooks";

const MAX_WALLETS_ON_DASHBOARD_LIST = 10;

export const WalletsGroup: React.VFC<WalletsGroupProperties> = ({ network, wallets, maxWidthReferences }) => {
	const { isExpanded, handleHeaderClick } = useAccordion();

	return (
		<AccordionWrapper data-testid="WalletsGroup" isCollapsed={!isExpanded} className="md:!mb-3">
			<WalletsGroupHeader
				network={network}
				wallets={wallets}
				onClick={handleHeaderClick}
				isExpanded={isExpanded}
				maxWidthReferences={maxWidthReferences}
				className="px-6 py-4"
			/>

			{isExpanded && (
				<WalletsList
					wallets={wallets}
					itemsPerPage={MAX_WALLETS_ON_DASHBOARD_LIST}
					showPagination={wallets.length > MAX_WALLETS_ON_DASHBOARD_LIST}
				/>
			)}
		</AccordionWrapper>
	);
};
