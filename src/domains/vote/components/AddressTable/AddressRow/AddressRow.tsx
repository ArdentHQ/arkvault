import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
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
import { useActiveProfile, useBreakpoint, useWalletAlias } from "@/app/hooks";
import { assertReadOnlyWallet } from "@/utils/assertions";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { ProfilePaths } from "@/router/paths";
import { Link } from "@/app/components/Link";

interface AddressRowProperties {
	index: number;
	maxVotes: number;
	wallet: Contracts.IReadWriteWallet;
	onSelect?: (walletAddress: string, walletNetwork: string) => void;
	isCompact?: boolean;
}

const StatusIcon = ({ label, icon, color }: { label: string; icon: string; color: string }) => (
	<Tooltip content={label}>
		<span>
			<Icon name={icon} className={color} size="lg" data-testid="StatusIcon__icon" />
		</span>
	</Tooltip>
);

export const WalletAvatar = ({ wallet, useCompact }: { useCompact?: boolean; wallet?: Contracts.IReadOnlyWallet }) => {
	if (!wallet) {
		return null;
	}

	return (
		<Tooltip content={wallet.username()}>
			<Link to={wallet.explorerLink()} isExternal className="flex">
				<Avatar
					className={cn({ "ring-2 ring-theme-background": useCompact })}
					size={useCompact ? "xs" : "lg"}
					address={wallet.address()}
					noShadow={useCompact}
				/>
			</Link>
		</Tooltip>
	);
};

export const AddressRow = ({ index, maxVotes, wallet, onSelect, isCompact = false }: AddressRowProperties) => {
	const { t } = useTranslation();
	const { profileHasSyncedOnce, profileIsSyncingWallets } = useConfiguration();
	const activeProfile = useActiveProfile();
	const { isMd, isSm, isXs } = useBreakpoint();
	const history = useHistory();

	const useCompact = useMemo(() => isCompact || isMd || isSm || isXs, [isCompact, isMd, isSm, isXs]);

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
	const [first, second, third, ...rest] = votes;

	const renderRestOfVotes = (restOfVotes: number) => {
		const rest = (
			<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-600">
				+{restOfVotes}
			</span>
		);

		if (useCompact) {
			return <div className="pl-3">{rest}</div>;
		}

		return (
			<Circle
				size="lg"
				className="relative border-theme-secondary-900 bg-theme-background dark:border-theme-secondary-600"
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

		return <StatusIcon label={t("WALLETS.STATUS.ACTIVE")} icon="CircleCheckMark" color="text-theme-success-600" />;
	};

	const renderWalletVotes = () => {
		if (!hasVotes) {
			return <span className="text-theme-secondary-400">{t("COMMON.NOT_AVAILABLE")}</span>;
		}

		if (maxVotes === 1) {
			return (
				<div className="flex items-center space-x-3 overflow-hidden">
					<Link
						to={votes[0].wallet?.explorerLink() as string}
						isExternal
						className="block w-24 truncate md:w-auto"
					>
						{votes[0].wallet?.username()}
					</Link>
				</div>
			);
		}

		return (
			<div className={cn("flex items-center", useCompact ? "-space-x-1" : "-space-x-2")}>
				<WalletAvatar wallet={first.wallet} />

				{second && <WalletAvatar wallet={second.wallet} />}

				{third && <WalletAvatar wallet={third.wallet} />}

				{rest && rest.length === 1 && <WalletAvatar wallet={rest[0].wallet} />}

				{rest && rest.length > 1 && renderRestOfVotes(rest.length)}
			</div>
		);
	};

	const isButtonDisabled =
		!wallet.hasBeenFullyRestored() ||
		!wallet.hasSyncedWithNetwork() ||
		!wallet.balance() ||
		!isLedgerWalletCompatible(wallet);

	return (
		<TableRow className="last:!border-b-4 last:border-solid last:border-theme-secondary-200 last:dark:border-theme-secondary-800">
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
				innerClassName={cn(
					"cursor-pointer group transition duration-300",
					{ "space-x-3": useCompact },
					{ "space-x-4": !useCompact },
				)}
				isCompact={useCompact}
			>
				<div className="w-40 flex-1">
					<Address
						address={wallet.address()}
						walletName={alias}
						showCopyButton
						walletNameClass="text-theme-primary-700 hover:border-current border-b border-transparent transition-[color,border-color] duration-[200ms,350ms] delay-[0s,100ms] leading-tight"
					/>
				</div>
			</TableCell>

			<TableCell
				className="hidden xl:table-cell"
				innerClassName="justify-end font-semibold text-theme-secondary-text whitespace-nowrap"
				isCompact={useCompact}
			>
				<Amount value={wallet.balance()} ticker={wallet.network().ticker()} />
			</TableCell>

			<TableCell
				innerClassName={cn("font-semibold", { "space-x-3": useCompact }, { "space-x-4": !useCompact })}
				isCompact={useCompact}
			>
				{renderWalletVotes()}
			</TableCell>

			{maxVotes === 1 ? (
				<>
					<TableCell
						className="hidden lg:table-cell"
						innerClassName="justify-center font-semibold text-theme-secondary-text"
						isCompact={useCompact}
					>
						{renderRank(votes[0]?.wallet)}
					</TableCell>

					<TableCell innerClassName="justify-center" isCompact={useCompact}>
						{renderDelegateStatus(votes[0]?.wallet, wallet.network().delegateCount())}
					</TableCell>
				</>
			) : (
				<TableCell innerClassName="justify-center" isCompact={useCompact}>
					<div className="font-semibold text-theme-secondary-400">
						<span className="text-theme-secondary-text">{hasVotes ? votes.length : "0"}</span>
						<span>/{maxVotes}</span>
					</div>
				</TableCell>
			)}

			<TableCell
				className="hidden lg:table-cell"
				innerClassName="justify-center space-x-2"
				isCompact={useCompact}
			>
				<WalletIcons wallet={wallet} exclude={["isKnown", "isSecondSignature", "isTestNetwork"]} />
			</TableCell>

			<TableCell className="pr-6" variant="end" innerClassName="justify-end !pr-0" isCompact={useCompact}>
				<Tooltip content={isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
					<div>
						<Button
							size={useCompact ? "icon" : undefined}
							disabled={isButtonDisabled}
							variant={useCompact ? "transparent" : "secondary"}
							className={cn({ "-mr-3 text-theme-primary-600 hover:text-theme-primary-700": useCompact })}
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
