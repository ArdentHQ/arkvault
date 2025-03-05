import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMediaQuery } from "react-responsive";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useActiveWallet, useWalletAlias } from "@/app/hooks";
import { assertReadOnlyWallet } from "@/utils/assertions";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";

interface AddressRowMobileProperties {
	index: number;
	maxVotes: number;
	wallet: Contracts.IReadWriteWallet;
	onSelect?: (walletAddress: string) => void;
}

const StatusIcon = ({ label, icon, color }: { label: string; icon: string; color: string }) => (
	<Tooltip content={label}>
		<span>
			<Icon name={icon} className={color} size="md" data-testid="StatusIcon__icon" />
		</span>
	</Tooltip>
);

export const AddressRowMobileDelegateName = ({ name }: { name?: string }) => {
	const is2Xs = useMediaQuery({ maxWidth: 410 });

	if (!name) {
		return null;
	}

	return (
		<div className="flex w-full items-center">
			<TruncateMiddle text={name} maxChars={is2Xs ? 50 : 19} />
		</div>
	);
};

export const AddressRowMobile = ({ index, wallet, onSelect }: AddressRowMobileProperties) => {
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const { profileHasSyncedOnce, profileIsSyncingWallets } = useConfiguration();

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

	const hasVotes = useMemo(() => votes.length > 0, [votes]);

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

	const renderDelegateStatus = (wallet: Contracts.IReadOnlyWallet | undefined, activeDelegates: number) => {
		if (!wallet) {
			return (
				<Circle
					size="xs"
					className="h-4 w-4 shrink-0 border-theme-secondary-300 dark:border-theme-secondary-800"
					noShadow
				/>
			);
		}

		assertReadOnlyWallet(wallet);

		if (wallet.isResignedDelegate()) {
			return <StatusIcon label={t("WALLETS.STATUS.RESIGNED")} icon="CircleCross" color="text-theme-danger-400" />;
		}

		if (Number(wallet.rank()) > activeDelegates) {
			return <StatusIcon label={t("WALLETS.STATUS.STANDBY")} icon="Clock" color="text-theme-warning-300" />;
		}

		return <StatusIcon label={t("WALLETS.STATUS.ACTIVE")} icon="CircleCheckMark" color="text-theme-primary-600" />;
	};

	const renderWalletVotes = () => {
		if (!hasVotes) {
			return (
				<span className="text-theme-secondary-500 dark:text-theme-dark-500">{t("COMMON.NOT_AVAILABLE")}</span>
			);
		}

		if (!votes[0].wallet) {
			return (
				<span
					data-testid="AddressRowMobile--nowallet"
					className="text-theme-secondary-500 dark:text-theme-dark-500"
				>
					{t("COMMON.NOT_AVAILABLE")}
				</span>
			);
		}

		// @TODO handle multiple validators
		return (
			<>
				{votes[0].wallet && (
					<div className="flex items-center">
						<div className="flex flex-1 justify-end overflow-hidden">
							<Link
								isExternal
								to={votes[0].wallet.explorerLink()}
								className="flex w-full items-center [&_svg]:text-theme-secondary-500 dark:[&_svg]:text-theme-dark-500"
							>
								<AddressRowMobileDelegateName
									name={votes[0].wallet.username() ?? votes[0].wallet.address()}
								/>
							</Link>
						</div>
					</div>
				)}
			</>
		);
	};

	return (
		<tr data-testid="AddressRowMobile">
			<td className="pt-3">
				<div className="flex flex-col overflow-hidden rounded border border-theme-secondary-300 dark:border-theme-secondary-800">
					<div className="flex justify-between overflow-hidden bg-theme-secondary-100 px-4 py-3 dark:bg-black">
						<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-text">
							{alias}
						</span>

						<Button
							disabled={!wallet.hasBeenFullyRestored() || !wallet.hasSyncedWithNetwork()}
							variant="transparent"
							onClick={(e) => {
								e.stopPropagation();
								onSelect?.(wallet.address());
							}}
							data-testid={`AddressRowMobile__select-${index}`}
							className="p-0 text-sm text-theme-primary-600 hover:text-theme-primary-700 hover:underline dark:hover:text-theme-primary-500"
						>
							{t("COMMON.VOTE")}
						</Button>
					</div>

					<div className="grid gap-4 px-4 py-3 sm:grid-cols-3">
						<div className="grid grid-cols-1 gap-2">
							<div className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-dark-200">
								{t("COMMON.ADDRESS")}
							</div>

							<div>
								<Address address={wallet.address()} size="sm" />
							</div>
						</div>

						<div className="grid grid-cols-1 gap-2">
							<div className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-dark-200">
								{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
							</div>

							<div>{renderWalletVotes()}</div>
						</div>
						<div className="grid grid-cols-1 gap-2">
							<div className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-dark-200">
								{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VALIDATOR_STATUS")}
							</div>

							<div>{renderDelegateStatus(votes[0]?.wallet, wallet.network().delegateCount())}</div>
						</div>
					</div>
				</div>
			</td>
		</tr>
	);
};
