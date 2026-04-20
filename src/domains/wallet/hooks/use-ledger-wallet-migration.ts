import { useEffect, useMemo, useState } from "react";
import { LocalStorage } from "@/app/lib/profiles/local.storage";
import { Contracts } from "@/app/lib/profiles";
import { WalletData } from "@/app/lib/profiles/wallet.enum";
import { ConfigKey } from "@/app/lib/mainsail";
import { BIP44 } from "@ardenthq/arkvault-crypto";

export const useLedgerMigrationStatus = (profile: Contracts.IProfile) => {
	const keys = {
		IsIgnored: `${profile.id()}:MigrationIsIgnored`,
		IsMigratingLater: `${profile.id()}:MigrationIsMigratingLater`,
	};

	const storage = new LocalStorage("localstorage");
	const [isIgnored, setIsIgnored] = useState(false);
	const [isMigratingLater, setIsMigratingLater] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const hasWalletsToMigrate = useMemo(
		() =>
			profile
				.wallets()
				.values()
				.some((wallet) => {
					if (wallet.isLedger()) {
						const slip44 = profile.activeNetwork().config().get(ConfigKey.Slip44);
						const slip44Legacy = profile.activeNetwork().config().get(ConfigKey.Slip44Legacy);

						const path = wallet.data().get<string>(WalletData.DerivationPath) ?? "";
						return [slip44, slip44Legacy].includes(BIP44.parse(path).coinType);
					}

					return false;
				}),
		[profile],
	);

	useEffect(() => {
		const loadStatus = async () => {
			setIsLoading(true);
			const isIgnored = await storage.get<boolean>(keys.IsIgnored);
			const isMigratingLater = await storage.get<boolean>(keys.IsMigratingLater);

			setIsIgnored(isIgnored ?? false);
			setIsMigratingLater(isMigratingLater ?? false);

			setIsLoading(false);
		};

		if (hasWalletsToMigrate) {
			loadStatus();
		}
	}, []);

	return {
		hasWalletsToMigrate,
		ignore: async () => {
			setIsIgnored(true);
			await storage.set(keys.IsIgnored, true);
		},
		isIgnored,
		isLoading,
		isMigratingLater,
		migrateLater: async () => {
			setIsMigratingLater(true);
			await storage.set(keys.IsMigratingLater, true);
		},
	};
};
