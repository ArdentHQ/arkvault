import { Contracts } from "@/app/lib/profiles";
import React, { JSX } from "react";
import { Networks } from "@/app/lib/mainsail";
import { MultipleImport } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerImportStep.blocks";
import { LedgerData } from "@/app/contexts";

export const SummaryStep = ({
	network,
	profile,
	wallets,
	onClickEditWalletName,
}: {
	network: Networks.Network;
	wallets: LedgerData[];
	profile: Contracts.IProfile;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}): JSX.Element => {
	return (
		<section data-testid="SummaryStep" className="space-y-4">
			<MultipleImport
				network={network}
				onClickEditWalletName={onClickEditWalletName}
				profile={profile}
				wallets={wallets}
			/>
		</section>
	);
};
