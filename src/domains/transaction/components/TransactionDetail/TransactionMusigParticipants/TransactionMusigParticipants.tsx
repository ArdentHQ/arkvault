import React, { useEffect, useState } from "react"
import { Table, TableCell, TableRow } from "@/app/components/Table"
import { TableWrapper } from "@/app/components/Table/TableWrapper"
import { Contracts } from "@ardenthq/sdk-profiles"
import { DTO } from "@ardenthq/sdk"
import { useTranslation } from "react-i18next";
import { Link } from "@/app/components/Link"
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic"
import { useResizeDetector } from "react-resize-detector"
import { useTheme } from "@/app/hooks/use-theme";
import { Clipboard } from "@/app/components/Clipboard"
import { Icon } from "@/app/components/Icon"


export const TransactionMusigParticipants = ({ transaction, profile }: { profile: Contracts.IProfile; transaction: DTO.RawTransactionData }) => {
	const { t } = useTranslation();
	const [participantWallets, setParticipantWallets] = useState<Contracts.IReadWriteWallet[]>([])
	const { ref, width } = useResizeDetector<HTMLElement>({ handleHeight: false });
	const { isDarkMode } = useTheme();

	useEffect(() => {
		const fetchData = async () => {
			const wallets: Contracts.IReadWriteWallet[] = []

			for (const publicKey of transaction.publicKeys()) {
				const network = transaction.wallet().network();
				const wallet = await profile.walletFactory().fromPublicKey({
					coin: network.coin(),
					network: network.id(),
					publicKey,
				})

				wallets.push(wallet)
			}

			setParticipantWallets(wallets)
		};

		fetchData()
	}, [transaction]);


	const renderRow = (wallet: Contracts.IReadWriteWallet) => (
		<TableRow className="relative group" key={wallet.address()}>
			<TableCell variant="start" key={wallet.address()}>
				<div className="flex items-center space-x-2 group" key={wallet.address()}>
					<Link to={wallet.explorerLink()} showExternalIcon={false} isExternal key={wallet.address()}><TruncateMiddleDynamic value={wallet.address()} availableWidth={width} /></Link>
					<Clipboard
						variant="icon"
						data={wallet.address()}
						tooltip={t("COMMON.COPY_ID")}
						tooltipDarkTheme={isDarkMode}
					>
						<Icon name="Copy" />
					</Clipboard>
				</div>
			</TableCell>
		</TableRow>
	)

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
	)
}
