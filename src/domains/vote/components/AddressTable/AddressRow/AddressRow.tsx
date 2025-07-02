import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Circle } from "@/app/components/Circle";
import { TableCell, TableRow } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useWalletAlias } from "@/app/hooks";
import { assertReadOnlyWallet } from "@/utils/assertions";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { Link } from "@/app/components/Link";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { twMerge } from "tailwind-merge";

interface AddressRowProperties {
	index: number;
	maxVotes: number;
	wallet: Contracts.IReadWriteWallet;
	onSelect?: (walletAddress: string) => void;
}

export const WalletStatus = ({
	wallet,
	activeValidators,
	fallback = <></>,
	className = "",
	dataTestId = "AddressRow__wallet-status",
}: {
	wallet?: Contracts.IReadOnlyWallet;
	activeValidators: number;
	fallback?: React.ReactNode;
	className?: string;
	dataTestId?: string;
}) => {
	const { t } = useTranslation();

	if (!wallet) {
		return fallback;
	}

	assertReadOnlyWallet(wallet);

	if (wallet.isResignedValidator()) {
		return (
			<div
				data-testid={dataTestId}
				className={twMerge(
					"bg-theme-warning-100 text-theme-warning-900 dark:border-theme-danger-info-border dark:text-theme-danger-info-text inline-block min-w-[58px] rounded px-1 py-[3px] text-center text-xs font-semibold dark:border dark:bg-transparent",
					className,
				)}
			>
				{t("WALLETS.STATUS.RESIGNED")}
			</div>
		);
	}

	if (Number(wallet.rank()) > activeValidators) {
		return (
			<div
				data-testid={dataTestId}
				className={twMerge(
					"bg-theme-warning-100 text-theme-warning-900 dark:border-theme-danger-info-border dark:text-theme-danger-info-text inline-block min-w-[58px] rounded px-1 py-[3px] text-center text-xs font-semibold dark:border dark:bg-transparent",
					className,
				)}
			>
				{t("WALLETS.STATUS.STANDBY")}
			</div>
		);
	}

	return (
		<div
			data-testid={dataTestId}
			className={twMerge(
				"bg-theme-success-100 text-theme-success-700 dark:border-theme-success-800 dark:text-theme-success-500 inline-block min-w-[58px] rounded px-1 py-[3px] text-center text-xs font-semibold dark:border dark:bg-transparent",
				className,
			)}
		>
			{t("WALLETS.STATUS.ACTIVE")}
		</div>
	);
};

export const WalletAvatar = ({ wallet }: { wallet?: Contracts.IReadOnlyWallet }) => {
	if (!wallet) {
		return null;
	}

	return (
		<Tooltip content={wallet.username()}>
			<Link to={wallet.explorerLink()} isExternal className="flex">
				<Avatar className="ring-theme-background ring-2" size="xs" address={wallet.address()} noShadow={true} />
			</Link>
		</Tooltip>
	);
};

export const AddressRow = ({ index, maxVotes, wallet, onSelect }: AddressRowProperties) => {
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const { profileHasSyncedOnce, profileIsSyncingWallets } = useConfiguration().getProfileConfiguration(
		activeProfile.id(),
	);

	const { getWalletAlias } = useWalletAlias();
	const { alias } = useMemo(
		() =>
			getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile: activeProfile,
			}),
		[activeProfile, getWalletAlias, wallet],
	);

	const [votes, setVotes] = useState<Contracts.VoteRegistryItem[]>([]);

	useEffect(() => {
		if (!profileHasSyncedOnce || profileIsSyncingWallets) {
			return;
		}

		const loadVotes = () => {
			let votes: Contracts.VoteRegistryItem[];

			try {
				votes = wallet.voting().current();
			} catch {
				votes = [];
			}

			setVotes(votes);
		};

		loadVotes();
	}, [profileHasSyncedOnce, profileIsSyncingWallets, wallet]);

	const hasVotes = votes.length > 0;

	const renderRestOfVotes = (restOfVotes: number) => {
		const rest = (
			<span className="text-theme-primary-700 dark:text-theme-secondary-500 text-sm font-semibold">
				+{restOfVotes}
			</span>
		);

		return (
			<Circle
				size="lg"
				className="border-theme-secondary-300 bg-theme-secondary-200 dark:border-theme-secondary-600 dark:bg-theme-secondary-800 relative h-8! w-8!"
			>
				{rest}
			</Circle>
		);
	};

	const renderRank = (wallet?: Contracts.IReadOnlyWallet) => {
		if (!wallet) {
			return;
		}

		assertReadOnlyWallet(wallet);

		if (wallet.rank()) {
			return <span>#{wallet.rank()}</span>;
		}

		return <span className="text-theme-secondary-400 dim:text-theme-dim-500">{t("COMMON.NOT_AVAILABLE")}</span>;
	};

	const renderWalletVotes = () => {
		if (!hasVotes) {
			return <span className="text-theme-secondary-400 dim:text-theme-dim-500">{t("COMMON.NOT_AVAILABLE")}</span>;
		}

		// @TODO handle multiple validators
		return (
			<div className="flex items-center space-x-3 overflow-hidden" data-testid="AddressRow__wallet-vote">
				{maxVotes > 1 && renderRestOfVotes(votes.length)}
				<Link
					to={votes[0].wallet?.explorerLink() as string}
					isExternal
					className="[&_svg]:text-theme-secondary-500 dark:[&_svg]:text-theme-dark-500 dim:[&_svg]:text-theme-dim-500 w-24 truncate md:w-auto"
				>
					{votes[0].wallet?.username() ?? (
						<TruncateMiddle text={votes[0].wallet?.address() ?? ""} maxChars={14} />
					)}
				</Link>
			</div>
		);
	};

	const isButtonDisabled =
		!wallet.hasBeenFullyRestored() ||
		!wallet.hasSyncedWithNetwork() ||
		!wallet.balance() ||
		!isLedgerWalletCompatible(wallet);

	return (
		<TableRow className="last:border-theme-secondary-200 dark:last:border-theme-secondary-800 relative last:border-b-4! last:border-solid">
			<TableCell data-testid="AddressRow__wallet" variant="start" innerClassName="cursor-pointer group space-x-3">
				<div className="w-40 flex-1">
					<Address
						address={wallet.address()}
						walletName={alias}
						showCopyButton
						addressClass="text-sm"
						walletNameClass="text-theme-primary-700 hover:border-current border-b border-transparent transition-[color,border-color] duration-[200ms,350ms] delay-[0s,100ms] leading-tight text-sm dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-700"
					/>
				</div>
			</TableCell>

			<TableCell
				className="hidden xl:table-cell"
				innerClassName="text-sm justify-end font-semibold text-theme-secondary-text whitespace-nowrap"
			>
				<Amount value={wallet.balance()} ticker={wallet.network().ticker()} />
			</TableCell>

			<TableCell innerClassName="text-sm font-semibold space-x-3">{renderWalletVotes()}</TableCell>

			{maxVotes === 1 ? (
				<>
					<TableCell
						className="hidden lg:table-cell"
						innerClassName="text-sm justify-center font-semibold text-theme-secondary-text"
					>
						{renderRank(votes[0]?.wallet)}
					</TableCell>

					<TableCell innerClassName="text-sm justify-center">
						<WalletStatus wallet={votes[0]?.wallet} activeValidators={wallet.network().validatorCount()} />
					</TableCell>
				</>
			) : (
				<TableCell innerClassName="text-sm justify-center">
					<div className="text-theme-secondary-400 font-semibold">
						<span className="text-theme-secondary-text">{hasVotes ? votes.length : "0"}</span>
						<span>/{maxVotes}</span>
					</div>
				</TableCell>
			)}

			<TableCell variant="end" innerClassName="justify-end">
				<Tooltip content={isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
					<div>
						<Button
							size="icon"
							disabled={isButtonDisabled}
							variant="transparent"
							className="text-theme-primary-600 dark:hover:text-theme-primary-500 hover:text-theme-primary-700 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-navy-700 dim:disabled:text-theme-dim-500 dim-hover:disabled:text-theme-dim-500 -mr-3 text-sm hover:underline"
							onClick={() => onSelect?.(wallet.address())}
							data-testid={`AddressRow__select-${index}`}
						>
							{t("COMMON.VOTE")}
						</Button>
					</div>
				</Tooltip>
			</TableCell>
		</TableRow>
	);
};
