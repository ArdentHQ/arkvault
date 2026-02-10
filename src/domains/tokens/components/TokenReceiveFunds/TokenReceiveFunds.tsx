import { Contracts } from "@/app/lib/profiles";
import { t } from "i18next";
import { useState } from "react";
import { ReceiveFunds } from "@/domains/wallet/components/ReceiveFunds";
import { SearchWallet } from "@/domains/wallet/components/SearchWallet";
import { SelectedWallet } from "@/domains/wallet/components/SearchWallet/SearchWallet.contracts";

export const TokenReceiveFunds = ({
	profile,
	wallets,
	isOpen = false,
	onClose,
}: {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
	isOpen?: boolean;
	onClose?: () => void;
}) => {
	const defaultSelectedWallet =
		wallets.length === 1
			? { address: wallets[0].address(), name: wallets[0].alias(), network: wallets[0].network() }
			: undefined;
	const [selectedWallet, setSelectedWallet] = useState<SelectedWallet | undefined>(defaultSelectedWallet);
	const selected = selectedWallet ?? defaultSelectedWallet;

	return (
		<>
			<SearchWallet
				profile={profile}
				isOpen={isOpen && !selected}
				title={t("PROFILE.MODAL_SELECT_ADDRESS.TITLE")}
				description={t("PROFILE.MODAL_SELECT_ADDRESS.DESCRIPTION")}
				searchPlaceholder={t("PROFILE.MODAL_SELECT_ADDRESS.SEARCH_PLACEHOLDER")}
				wallets={wallets}
				onSelectWallet={setSelectedWallet}
				onClose={() => {
					setSelectedWallet(undefined);
					onClose?.();
				}}
			/>

			{isOpen && !!selected && (
				<ReceiveFunds
					address={selected.address}
					name={selected.name}
					network={selected.network}
					onClose={() => {
						setSelectedWallet(undefined);
						onClose?.();
					}}
				/>
			)}
		</>
	);
};
