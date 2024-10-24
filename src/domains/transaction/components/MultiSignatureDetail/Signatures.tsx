import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Tooltip } from "@/app/components/Tooltip";
import { useMultiSignatureStatus } from "@/domains/transaction/hooks";
import { Icon } from "@/app/components/Icon";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import { AddressCopy, AddressLabel } from "@/app/components/Address";
import { useMusigParticipants } from "@/domains/transaction/hooks/use-musig-participants";
import { Skeleton } from "@/app/components/Skeleton";

const ParticipantStatus = ({
	transaction,
	publicKey,
	wallet,
}: {
	transaction: DTO.ExtendedSignedTransactionData;
	publicKey: string;
	wallet: Contracts.IReadWriteWallet;
}) => {
	const { t } = useTranslation();
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

	const status = isAwaitingSignature ? t("COMMON.AWAITING_SIGNATURE") : t("COMMON.SIGNED");

	return (
		<div data-testid="Signatures__participant-status" className="relative">
			<Tooltip content={status}>
				<div>
					{isAwaitingSignature && (
						<Icon
							size="lg"
							name="Clock"
							data-testid="ParticipantStatus__waiting"
							className="text-theme-secondary-500 dark:text-theme-secondary-700"
						/>
					)}
					{!isAwaitingSignature && (
						<Icon
							name="CircleCheckMark"
							size="lg"
							className="text-theme-primary-500"
							data-testid="ParticipantStatus__signed"
						/>
					)}
				</div>
			</Tooltip>
		</div>
	);
};

const ParticipantRow = ({
	wallet,
	transaction,
}: {
	wallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}) => (
	<TableRow className="group relative max-md:!border-transparent" key={wallet.address()}>
		<TableCell
			variant="start"
			innerClassName="text-sm font-semibold justify-between sm:justify-start max-sm:bg-theme-secondary-100 max-sm:dark:bg-black max-sm:m-3 max-sm:mb-0 max-sm:px-4 max-sm:py-3 max-sm:border max-sm:rounded-md max-sm:border-theme-secondary-300 max-sm:dark:border-theme-secondary-800"
		>
			<div className="flex w-full space-x-2">
				<div className="w-full sm:w-auto">
					<AddressLabel>{wallet.address()}</AddressLabel>
				</div>

				<AddressCopy address={wallet.address()} />
			</div>

			<div className="ml-2 border-l border-theme-secondary-300 pl-2 dark:border-theme-secondary-800 sm:hidden">
				<ParticipantStatus
					transaction={transaction}
					wallet={transaction.wallet()}
					publicKey={wallet.publicKey()!}
				/>
			</div>
		</TableCell>

		<TableCell variant="end" innerClassName="flex justify-end max-sm:hidden">
			<ParticipantStatus
				transaction={transaction}
				wallet={transaction.wallet()}
				publicKey={wallet.publicKey()!}
			/>
		</TableCell>
	</TableRow>
);

const ParticipantRowSkeleton = () => (
	<TableRow className="group relative max-md:!border-transparent">
		<TableCell
			variant="start"
			innerClassName="text-sm font-semibold justify-between sm:justify-start max-sm:bg-theme-secondary-100 max-sm:dark:bg-black max-sm:m-3 max-sm:mb-0 max-sm:px-4 max-sm:py-3 max-sm:border max-sm:rounded-md max-sm:border-theme-secondary-300 max-sm:dark:border-theme-secondary-800"
		>
			<div className="flex w-full space-x-2">
				<div className="w-full sm:w-2/3">
					<Skeleton className="w-full" height={20} />
				</div>

				<Skeleton width={20} height={20} />
			</div>

			<div className="ml-2 border-l border-theme-secondary-300 pl-2 dark:border-theme-secondary-800 sm:hidden">
				<Skeleton width={20} height={20} />
			</div>
		</TableCell>

		<TableCell variant="end" innerClassName="flex justify-end max-sm:hidden">
			<Skeleton width={20} height={20} />
		</TableCell>
	</TableRow>
);

export const Signatures = ({
	profile,
	publicKeys,
	transaction,
}: {
	profile: Contracts.IProfile;
	publicKeys: string[];
	transaction: DTO.ExtendedSignedTransactionData;
}) => {
	const { t } = useTranslation();

	const { participants, isLoading } = useMusigParticipants({
		network: transaction.wallet().network(),
		profile,
		publicKeys,
	});

	const skeletonRows = Array.from({ length: publicKeys.length }, () => ({}) as Contracts.IReadWriteWallet);

	const data = isLoading ? skeletonRows : participants;

	return (
		<TableWrapper className="sm:border-b-[5px] sm:border-b-theme-secondary-200 sm:outline-theme-secondary-300 dark:sm:border-theme-secondary-800 dark:sm:outline-theme-secondary-800">
			<Table
				columns={[
					{
						Header: t("COMMON.ADDRESS"),
						headerClassName: "max-sm:hidden",
					},
					{
						Header: t("COMMON.STATUS"),
						headerClassName: "max-sm:hidden text-right w-8 border-theme-secondary-100",
					},
				]}
				data={data}
			>
				{(participantWallet) => {
					if (isLoading) {
						return <ParticipantRowSkeleton />;
					}

					return (
						<ParticipantRow
							key={participantWallet.address()}
							wallet={participantWallet}
							transaction={transaction}
						/>
					);
				}}
			</Table>
		</TableWrapper>
	);
};
