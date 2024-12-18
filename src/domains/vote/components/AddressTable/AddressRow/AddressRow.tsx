import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { generatePath } from "react-router";
import { useHistory } from "react-router-dom";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { TableCell, TableRow } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { WalletIcons } from "@/app/components/WalletIcons";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useWalletAlias } from "@/app/hooks";
import { assertReadOnlyWallet } from "@/utils/assertions";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { ProfilePaths } from "@/router/paths";
import { Link } from "@/app/components/Link";

interface AddressRowProperties {
	index: number;
	maxVotes: number;
	wallet: Contracts.IReadWriteWallet;
	onSelect?: (walletAddress: string, walletNetwork: string) => void;
}

const StatusIcon = ({ label, icon, color }: { label: string; icon: string; color: string }) => (
	<Tooltip content={label}>
		<span>
			<Icon name={icon} className={color} size="lg" data-testid="StatusIcon__icon" />
		</span>
	</Tooltip>
);

export const WalletAvatar = ({ wallet }: { wallet?: Contracts.IReadOnlyWallet }) => {
	if (!wallet) {
		return null;
	}

	return (
		<Tooltip content={wallet.username()}>
			<Link to={wallet.explorerLink()} isExternal className="flex">
				<Avatar className="ring-2 ring-theme-background" size="xs" address={wallet.address()} noShadow={true} />
			</Link>
		</Tooltip>
	);
};

export const AddressRow = ({ index, maxVotes, wallet, onSelect }: AddressRowProperties) => {
	const { t } = useTranslation();
	const { profileHasSyncedOnce, profileIsSyncingWallets } = useConfiguration();
	const activeProfile = useActiveProfile();
	const history = useHistory();

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
			<span className="text-sm font-semibold text-theme-primary-700 dark:text-theme-secondary-500">
				+{restOfVotes}
			</span>
		);

		return (
			<Circle
				size="lg"
				className="relative !h-8 !w-8 border-theme-secondary-300 bg-theme-secondary-200 dark:border-theme-secondary-600 dark:bg-theme-secondary-800"
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

		return <span className="text-theme-secondary-400">{t("COMMON.NOT_AVAILABLE")}</span>;
	};

	const renderDelegateStatus = (wallet: Contracts.IReadOnlyWallet | undefined, activeDelegates: number) => {
		if (!wallet) {
			return <></>;
		}

		assertReadOnlyWallet(wallet);

		if (wallet.isResignedDelegate()) {
			return <StatusIcon label={t("WALLETS.STATUS.RESIGNED")} icon="CircleCross" color="text-theme-danger-400" />;
		}

		if (Number(wallet.rank()) > activeDelegates) {
			return <StatusIcon label={t("WALLETS.STATUS.STANDBY")} icon="Clock" color="text-theme-warning-300" />;
		}

		return (
			<StatusIcon
				label={t("WALLETS.STATUS.ACTIVE")}
				icon="CircleCheckMark"
				color="text-theme-navy-600 dark:text-theme-primary-600"
			/>
		);
	};

	const renderWalletVotes = () => {
		if (!hasVotes) {
			return <span className="text-theme-secondary-400">{t("COMMON.NOT_AVAILABLE")}</span>;
		}

		// @TODO handle multiple validators
		return (
			<div className="flex items-center space-x-3 overflow-hidden">
				{maxVotes > 1 && renderRestOfVotes(votes.length)}
				<Link
					to={votes[0].wallet?.explorerLink() as string}
					isExternal
					className="w-24 truncate md:w-auto [&_svg]:text-theme-secondary-500 dark:[&_svg]:text-theme-secondary-700"
				>
					{votes[0].wallet?.username()}
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
		<TableRow className="relative last:!border-b-4 last:border-solid last:border-theme-secondary-200 last:dark:border-theme-secondary-800">
			<TableCell
				data-testid="AddressRow__wallet"
				onClick={() => {
					history.push(
						generatePath(ProfilePaths.WalletDetails, {
							profileId: activeProfile.id(),
							walletId: wallet.id(),
						}),
					);
				}}
				variant="start"
				innerClassName="cursor-pointer group space-x-3"
			>
				<div className="w-40 flex-1">
					<Address
						address={wallet.address()}
						walletName={alias}
						showCopyButton
						addressClass="text-sm"
						walletNameClass="text-theme-primary-700 hover:border-current border-b border-transparent transition-[color,border-color] duration-[200ms,350ms] delay-[0s,100ms] leading-tight text-sm"
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
						{renderDelegateStatus(votes[0]?.wallet, wallet.network().delegateCount())}
					</TableCell>
				</>
			) : (
				<TableCell innerClassName="text-sm justify-center">
					<div className="font-semibold text-theme-secondary-400">
						<span className="text-theme-secondary-text">{hasVotes ? votes.length : "0"}</span>
						<span>/{maxVotes}</span>
					</div>
				</TableCell>
			)}

			<TableCell className="hidden lg:table-cell" innerClassName="text-sm justify-center space-x-2">
				<WalletIcons wallet={wallet} exclude={["isKnown", "isSecondSignature", "isTestNetwork"]} />
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end">
				<Tooltip content={isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
					<div>
						<Button
							size="icon"
							disabled={isButtonDisabled}
							variant="transparent"
							className="-mr-3 text-sm text-theme-primary-600 hover:text-theme-primary-700 hover:underline dark:hover:text-theme-primary-500"
							onClick={() => onSelect?.(wallet.address(), wallet.networkId())}
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
