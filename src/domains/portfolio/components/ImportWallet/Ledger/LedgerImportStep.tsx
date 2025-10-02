import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { LedgerData } from "@/app/contexts/Ledger";
import { MultipleImport, SingleImport } from "./LedgerImportStep.blocks";

export const LedgerImportStep = ({
	onClickEditWalletName,
	profile,
	wallets,
	network,
}: {
	network: Networks.Network;
	wallets: LedgerData[];
	profile: Contracts.IProfile;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}) => (
	<section data-testid="LedgerImportStep">
		{wallets.length > 1 ? (
			<MultipleImport
				wallets={wallets}
				profile={profile}
				network={network}
				onClickEditWalletName={onClickEditWalletName}
			/>
		) : (
			<SingleImport
				wallets={wallets}
				profile={profile}
				network={network}
				onClickEditWalletName={onClickEditWalletName}
			/>
		)}
	</section>
);
