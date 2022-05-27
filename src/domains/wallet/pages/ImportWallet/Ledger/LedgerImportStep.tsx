import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
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
import { TransactionDetail, TransactionNetwork } from "@/domains/transaction/components/TransactionDetail";
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

	return (
		<div>
			<ul>
				{wallets.map((wallet) => {
					const importedWallet = profile.wallets().findByAddressWithNetwork(wallet.address, network.id());
					assertWallet(importedWallet);

					return (
						<li key={wallet.address}>
							<TransactionDetail
								className="py-4"
								paddingPosition="none"
								borderPosition="bottom"
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
							</TransactionDetail>
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

	const ledgerWallet = wallets[0];

	const wallet = profile.wallets().findByAddressWithNetwork(ledgerWallet.address, network.id());
	assertWallet(wallet);

	return (
		<>
			<TransactionDetail
				label={t("COMMON.ADDRESS")}
				extra={<Avatar size="lg" address={ledgerWallet.address} />}
				borderPosition="bottom"
				paddingPosition="bottom"
			>
				<Address address={ledgerWallet.address} />
			</TransactionDetail>

			<TransactionDetail label={t("COMMON.BALANCE")} borderPosition="bottom" paddingPosition="bottom">
				<Amount value={ledgerWallet.balance ?? 0} ticker={network.ticker()} />
			</TransactionDetail>

			<TransactionDetail
				label={t("WALLETS.WALLET_NAME")}
				padding={false}
				border={false}
				extra={
					<Button
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
			</TransactionDetail>
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
		<section data-testid="LedgerImportStep" className="space-y-6">
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.LEDGER_IMPORT_STEP.SUBTITLE")}
			/>

			<TransactionNetwork network={network} borderPosition="bottom" paddingPosition="bottom" />

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
