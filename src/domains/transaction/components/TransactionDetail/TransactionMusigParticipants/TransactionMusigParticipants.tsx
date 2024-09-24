import React, { useEffect, useState } from "react";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { Contracts } from "@ardenthq/sdk-profiles";
import { DTO } from "@ardenthq/sdk";
import { useTranslation } from "react-i18next";
import { Link } from "@/app/components/Link";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { useResizeDetector } from "react-resize-detector";
import { useTheme } from "@/app/hooks/use-theme";
import { Clipboard } from "@/app/components/Clipboard";
import { Icon } from "@/app/components/Icon";

import { assertString } from "@/utils/assertions";
import { getMusigParticipantWallets, getMusigPublicKeys } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";

const addressFromPublicKey = async (wallet: Contracts.IReadWriteWallet, publicKey?: string) => {
	if (publicKey === wallet.publicKey() && wallet.isLedger()) {
		const derivationPath = wallet.data().get(Contracts.WalletData.DerivationPath);
		assertString(derivationPath);

		const ledgerWalletPublicKey = await wallet.ledger().getPublicKey(derivationPath);
		const { address } = await wallet.coin().address().fromPublicKey(ledgerWalletPublicKey);

		return address;
	}

	assertString(publicKey);

	const { address } = await wallet.coin().address().fromPublicKey(publicKey);

	return address;
};

export const TransactionMusigParticipants = ({
	transaction,
	profile,
}: {
	profile: Contracts.IProfile;
	transaction: DTO.RawTransactionData;
}) => {
	const { t } = useTranslation();

	const [participantWallets, setParticipantWallets] = useState<Contracts.IReadWriteWallet[]>([]);

	const { width } = useResizeDetector<HTMLElement>({ handleHeight: false });
	const { isDarkMode } = useTheme();

	useEffect(() => {
		const constructParticipantWallets = async () => {
			const wallets = await getMusigParticipantWallets(profile, transaction);
			setParticipantWallets(wallets);
		};

		fetchData();
	}, [transaction]);

	const renderRow = (wallet: Contracts.IReadWriteWallet) => (
		<TableRow className="group relative" key={wallet.address()}>
			<TableCell variant="start" key={wallet.address()}>
				<div className="group flex items-center space-x-2 text-sm" key={wallet.address()}>
					<Link to={wallet.explorerLink()} showExternalIcon={false} isExternal key={wallet.address()}>
						<TruncateMiddleDynamic value={wallet.address()} availableWidth={width} />
					</Link>
					<Clipboard
						variant="icon"
						data={wallet.address()}
						tooltip={t("COMMON.COPY_ID")}
						tooltipDarkTheme={isDarkMode}
					>
						<Icon
							name="Copy"
							className="emotion-cache-v0ob3f text-theme-primary-400 dark:text-theme-secondary-700 dark:hover:text-theme-secondary-500"
						/>
					</Clipboard>
				</div>
			</TableCell>
		</TableRow>
	);

	return (
		<TableWrapper>
			<Table
				columns={[
					{
						Header: t("COMMON.ADDRESS"),
						headerClassName: "hidden sm:block",
					},
				]}
				data={participantWallets}
			>
				{renderRow}
			</Table>
		</TableWrapper>
	);
};
