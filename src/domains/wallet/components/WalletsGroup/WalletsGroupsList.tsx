import React, { useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Link } from "@/app/components/Link";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { useWalletFilters } from "@/domains/dashboard/components/FilterWallets/hooks";
import { WalletsGroup } from "@/domains/wallet/components/WalletsGroup/WalletsGroup";
import { WalletsGroupHeaderSkeleton } from "@/domains/wallet/components/WalletsGroup/WalletsGroupHeader";
import { useDisplayWallets } from "@/domains/wallet/hooks/use-display-wallets";
import { MdAndAbove } from "@/app/components/Breakpoint";
import { AccordionWrapper } from "@/app/components/Accordion";

export const WalletsGroupsList = () => {
	const { t } = useTranslation();
	const profile = useActiveProfile();
	const { profileIsSyncing } = useConfiguration();
	const { availableWallets, filteredWalletsGroupedByNetwork, hasWalletsMatchingOtherNetworks } = useDisplayWallets();
	const { walletsDisplayType } = useWalletFilters({ profile });
	const isRestored = profile.status().isRestored();

	const balanceMaxWidthReference = useRef(0);
	const currencyMaxWidthReference = useRef(0);

	const emptyBlockContent = () => {
		if (walletsDisplayType !== "all") {
			return (
				<Trans
					i18nKey={
						hasWalletsMatchingOtherNetworks
							? "DASHBOARD.WALLET_CONTROLS.EMPTY_MESSAGE_TYPE_FILTERED"
							: "DASHBOARD.WALLET_CONTROLS.EMPTY_MESSAGE_TYPE"
					}
					values={{
						type: walletsDisplayType === "starred" ? t("COMMON.STARRED") : t("COMMON.LEDGER"),
					}}
					components={{ bold: <strong /> }}
				/>
			);
		}

		if (hasWalletsMatchingOtherNetworks) {
			return t("DASHBOARD.WALLET_CONTROLS.EMPTY_MESSAGE_FILTERED");
		}

		const createLink = <Link to={`/profiles/${profile.id()}/wallets/create`}>{t("COMMON.CREATE")}</Link>;
		const importLink = <Link to={`/profiles/${profile.id()}/wallets/import`}>{t("COMMON.IMPORT")}</Link>;

		return (
			<Trans i18nKey={"DASHBOARD.WALLET_CONTROLS.EMPTY_MESSAGE"}>
				Your portfolio is currently empty. {createLink} or {importLink} a wallet to get started.
			</Trans>
		);
	};

	const renderContent = () => {
		if (profileIsSyncing && availableWallets.length === 0) {
			return (
				<AccordionWrapper>
					<WalletsGroupHeaderSkeleton />
				</AccordionWrapper>
			);
		}

		if (isRestored && filteredWalletsGroupedByNetwork.length === 0) {
			return (
				<>
					<EmptyBlock className="mx-8 mt-2 sm:-mt-1 md:mx-0 md:mb-3">{emptyBlockContent()}</EmptyBlock>
					<MdAndAbove>
						<AccordionWrapper isInactive>
							<WalletsGroupHeaderSkeleton isPlaceholder />
						</AccordionWrapper>
					</MdAndAbove>
				</>
			);
		}

		/* istanbul ignore else -- @preserve */
		if (!profileIsSyncing || availableWallets.length > 0) {
			return filteredWalletsGroupedByNetwork.map(([network, wallets]) => (
				<WalletsGroup
					key={network.id()}
					network={
						profile.availableNetworks().find((profileNetwork) => profileNetwork.id() === network.id()) ||
						network
					}
					wallets={wallets}
					maxWidthReferences={{ balance: balanceMaxWidthReference, currency: currencyMaxWidthReference }}
					profileId={profile.id()}
				/>
			));
		}
	};

	return <div data-testid="NetworkWalletsGroupList">{renderContent()}</div>;
};
