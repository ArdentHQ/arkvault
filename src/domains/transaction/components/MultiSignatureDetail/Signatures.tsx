import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getMultiSignatureInfo } from "./MultiSignatureDetail.helpers";
import { Avatar } from "@/app/components/Avatar";
import { Badge } from "@/app/components/Badge";
import { Tooltip } from "@/app/components/Tooltip";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";

const WaitingBadge = () => {
	const { t } = useTranslation();

	return (
		<Tooltip content={t("COMMON.AWAITING_SIGNATURE")}>
			<Badge
				data-testid="Signatures__waiting-badge"
				className="border-transparent bg-theme-danger-100 text-theme-danger-400 dark:bg-theme-danger-400 dark:text-white"
				icon="ClockSmall"
			/>
		</Tooltip>
	);
};

const SignedBadge = () => {
	const { t } = useTranslation();

	return (
		<Tooltip content={t("COMMON.SIGNED")}>
			<Badge
				data-testid="Signatures__signed-badge"
				className="border-transparent bg-theme-success-200 text-theme-success-500 dark:bg-theme-success-600 dark:text-white"
				icon="CheckmarkSmall"
			/>
		</Tooltip>
	);
};

const ParticipantStatus = ({
	transaction,
	publicKey,
	wallet,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	publicKey: string;
	wallet: Contracts.IReadWriteWallet;
}) => {
	const { isAwaitingOurFinalSignature } = useMultiSignatureStatus({ transaction, wallet });

	const isAwaitingSignature = useMemo(() => {
		try {
			if (
				transaction.isMultiSignatureRegistration() &&
				!wallet.transaction().isAwaitingOurSignature(transaction.id()) &&
				!wallet.transaction().isAwaitingOtherSignatures(transaction.id())
			) {
				return false;
			}

			if (transaction.isMultiSignatureRegistration() && isAwaitingOurFinalSignature) {
				return false;
			}

			return wallet.transaction().isAwaitingSignatureByPublicKey(transaction.id(), publicKey);
		} catch {
			return false;
		}
	}, [wallet, transaction, publicKey]);

	const [address, setAddress] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			const { address } = await wallet.coin().address().fromPublicKey(publicKey);
			setAddress(address);
		};
		fetchData();
	}, [wallet, publicKey]);

	return (
		<div data-testid="Signatures__participant-status" className="relative">
			<Tooltip content={address}>
				<div>
					<Avatar address={address} size="lg" />
				</div>
			</Tooltip>

			{isAwaitingSignature ? <WaitingBadge /> : <SignedBadge />}
		</div>
	);
};

export const Signatures = ({
	transaction,
	wallet,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	wallet: Contracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();

	const { publicKeys: participantPublicKeys } = getMultiSignatureInfo(transaction);
	const publicKeys = participantPublicKeys.filter((pubKey) => pubKey !== wallet.publicKey());

	return (
		<div data-testid="Signatures">
			<h3>{t("TRANSACTION.SIGNATURES")}</h3>

			<div className="flex">
				<div>
					<div className="mb-2 text-sm font-semibold text-theme-secondary-500">{t("COMMON.YOU")}</div>

					<div className="mr-2 border-r border-theme-secondary-300 pr-6 dark:border-theme-secondary-800">
						<ParticipantStatus transaction={transaction} publicKey={wallet.publicKey()!} wallet={wallet} />
					</div>
				</div>

				<div>
					<div className="mb-2 ml-2 text-sm font-semibold text-theme-secondary-500">{t("COMMON.OTHER")}</div>
					<div className="ml-2 flex space-x-4">
						{publicKeys.map((publicKey) => (
							<ParticipantStatus
								key={publicKey}
								transaction={transaction}
								publicKey={publicKey}
								wallet={wallet}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
