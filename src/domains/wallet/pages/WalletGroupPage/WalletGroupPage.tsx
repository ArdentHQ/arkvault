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
				<div className="flex flex-col rounded-xl border-transparent outline outline-1 outline-transparent dark:bg-theme-background md:border-2 md:border-b-[5px] md:border-b-theme-secondary-200 md:outline-theme-navy-100 dark:md:border-theme-secondary-800 dark:md:outline-theme-secondary-800">
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
						className="px-0 md:border-t md:border-t-theme-secondary-300 md:px-0 md:dark:border-t-theme-secondary-800"
					/>
				</div>
			</Section>
		</Page>
	);
};
