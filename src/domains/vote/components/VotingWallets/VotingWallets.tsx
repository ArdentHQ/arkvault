import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { EmptyResults } from "@/app/components/EmptyResults";
import { AddressTable } from "@/domains/vote/components/AddressTable";
import { Section } from "@/app/components/Layout";

interface VotingWalletsProperties {
	showEmptyResults: boolean;
	walletsByCoin: Record<string, Contracts.IReadWriteWallet[]>;
	onSelectAddress: (address: string, network: string) => void;
	isCompact?: boolean;
	profile: Contracts.IProfile;
}

export const VotingWallets = ({
	showEmptyResults,
	walletsByCoin,
	onSelectAddress,
	isCompact,
	profile,
}: VotingWalletsProperties) => {
	const { t } = useTranslation();

	if (showEmptyResults) {
		return (
			<Section>
				<EmptyResults
					className="mt-16"
					title={t("COMMON.EMPTY_RESULTS.TITLE")}
					subtitle={t("COMMON.EMPTY_RESULTS.SUBTITLE")}
				/>
			</Section>
		);
	}

	return (
		<div className="salam">
			{Object.keys(walletsByCoin).map(
				(coin, index) =>
					walletsByCoin[coin].length > 0 && (
						<AddressTable
							key={index}
							wallets={walletsByCoin[coin]}
							onSelect={onSelectAddress}
							isCompact={isCompact}
							profile={profile}
						/>
					),
			)}
		</div>
	);
};
