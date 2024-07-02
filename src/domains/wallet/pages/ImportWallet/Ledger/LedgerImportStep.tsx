import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Header } from "@/app/components/Header";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { LedgerData } from "@/app/contexts/Ledger";
import { useBreakpoint } from "@/app/hooks";
import { WalletDetail } from "@/domains/wallet/components/WalletDetail";
import { WalletDetailAddress } from "@/domains/wallet/components/WalletDetailAddress";
import { WalletDetailNetwork } from "@/domains/wallet/components/WalletDetailNetwork";
import { assertNetwork, assertWallet } from "@/utils/assertions";

const MultipleImport = ({
	network,
	onClickEditWalletName,
	profile,
	wallets,
}: {
	network: Networks.Network;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
	profile: Contracts.IProfile;
	wallets: LedgerData[];
}) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	return (
		<div>
			<ul>
				{wallets.map((wallet, index) => {
					const importedWallet = profile.wallets().findByAddressWithNetwork(wallet.address, network.id());
					assertWallet(importedWallet);

					return (
						<li key={wallet.address}>
							<WalletDetail
								className={cn("py-4", {
									"pb-6": index === wallets.length - 1,
									"pt-6": index === 0,
								})}
								paddingPosition="none"
								borderPosition={!isXs && index === wallets.length - 1 ? "both" : "top"}
								extra={
									<Tooltip content={t("WALLETS.WALLET_NAME")}>
										<Button
											data-testid="LedgerImportStep__edit-alias"
											type="button"
											variant="secondary"
											onClick={() => onClickEditWalletName(importedWallet)}
										>
											<Icon name="Pencil" />
										</Button>
									</Tooltip>
								}
							>
								<div className="flex w-0 flex-1 items-center space-x-3 overflow-hidden">
									<Avatar size="lg" address={wallet.address} />

									<div className="flex w-full min-w-0 flex-col justify-between">
										<Address walletName={importedWallet.alias()} address={wallet.address} />
										<p className="text-sm font-medium text-theme-secondary-500">
											<Amount value={wallet.balance ?? 0} ticker={network.ticker()} />
										</p>
									</div>
								</div>
							</WalletDetail>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

const SingleImport = ({
	network,
	onClickEditWalletName,
	profile,
	wallets,
}: {
	network: Networks.Network;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
	profile: Contracts.IProfile;
	wallets: LedgerData[];
}) => {
	const { t } = useTranslation();
	const { isXs } = useBreakpoint();

	const ledgerWallet = wallets[0];

	const wallet = profile.wallets().findByAddressWithNetwork(ledgerWallet.address, network.id());
	assertWallet(wallet);

	return (
		<>
			<WalletDetailAddress address={ledgerWallet.address} />

			<WalletDetail label={t("COMMON.BALANCE")}>
				<Amount value={ledgerWallet.balance ?? 0} ticker={network.ticker()} />
			</WalletDetail>

			<WalletDetail
				label={t("WALLETS.WALLET_NAME")}
				borderPosition={isXs ? "top" : "both"}
				extra={
					<Button
						size="xs"
						data-testid="LedgerImportStep__edit-alias"
						type="button"
						variant="secondary"
						onClick={() => onClickEditWalletName(wallet)}
					>
						<Icon name="Pencil" />
					</Button>
				}
			>
				{wallet.alias()}
			</WalletDetail>
		</>
	);
};

export const LedgerImportStep = ({
	onClickEditWalletName,
	profile,
	wallets,
}: {
	wallets: LedgerData[];
	profile: Contracts.IProfile;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}) => {
	const { t } = useTranslation();

	const { watch } = useFormContext();

	const [network] = useState(() => watch("network"));
	assertNetwork(network);

	return (
		<section data-testid="LedgerImportStep">
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.SUBTITLE", { count: wallets.length })}
			/>

			<WalletDetailNetwork network={network} className="mt-2" border={false} />

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
};
