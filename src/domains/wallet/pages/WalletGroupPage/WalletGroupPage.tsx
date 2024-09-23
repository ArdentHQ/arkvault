import React, { useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Page, Section } from "@/app/components/Layout";
import { WalletsGroupHeader } from "@/domains/wallet/components/WalletsGroup/WalletsGroupHeader";
import { WalletsList } from "@/domains/wallet/components/WalletsList/WalletsList";
import { useDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets";
import { useBreakpoint } from "@/app/hooks";

const MAX_WALLETS_ON_SINGLE_PAGE_LIST = 15;

export const WalletGroupPage: React.VFC = () => {
	const history = useHistory();
	const { isMdAndAbove } = useBreakpoint();
	const { networkId } = useParams<{ networkId: string }>();
	const { walletsGroupedByNetwork, availableNetworks } = useDisplayWallets();

	const network = useMemo(
		() => availableNetworks.find((network) => network.id() === networkId),
		[availableNetworks, networkId],
	);

	const wallets = useMemo(
		() => (network && walletsGroupedByNetwork.get(network)) ?? [],
		[walletsGroupedByNetwork, network],
	);

	if (!networkId || !network) {
		history.push("/");
		return <></>;
	}

	return (
		<Page pageTitle={network.coin()}>
			<Section>
				<div className="flex flex-col rounded-xl border-theme-navy-100 dark:border-theme-secondary-800 dark:bg-theme-background md:border-2">
					<WalletsGroupHeader
						network={network}
						wallets={wallets}
						isExpanded={false}
						className="px-0 md:px-8"
					/>

					<WalletsList
						wallets={wallets}
						itemsPerPage={MAX_WALLETS_ON_SINGLE_PAGE_LIST}
						showPagination={isMdAndAbove}
						className="border-t border-t-theme-secondary-300 px-0 dark:border-t-theme-secondary-800 md:px-0"
					/>
				</div>
			</Section>
		</Page>
	);
};
