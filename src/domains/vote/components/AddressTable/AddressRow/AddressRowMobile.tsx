import { Contracts } from "@ardenthq/sdk-profiles";
import { generatePath } from "react-router";
import { useHistory } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMediaQuery } from "react-responsive";
import { Circle } from "@/app/components/Circle";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useWalletAlias } from "@/app/hooks";
import { assertReadOnlyWallet } from "@/utils/assertions";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Divider } from "@/app/components/Divider";
import { Link } from "@/app/components/Link";
import { ProfilePaths } from "@/router/paths";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";

interface AddressRowMobileProperties {
	index: number;
	maxVotes: number;
	wallet: Contracts.IReadWriteWallet;
	onSelect?: (walletAddress: string, walletNetwork: string) => void;
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
			<TruncateMiddle text={name} maxChars={is2Xs ? 10 : 50} />
		</div>
	);
};

export const AddressRowMobile = ({ index, wallet, onSelect }: AddressRowMobileProperties) => {
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const { profileHasSyncedOnce, profileIsSyncingWallets } = useConfiguration();
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
				<>
					<Circle size="xs" className="border-theme-secondary-300 dark:border-theme-secondary-800" noShadow />

					<span className="text-theme-secondary-400">{t("COMMON.NOT_AVAILABLE")}</span>
				</>
			);
		}

		if (!votes[0].wallet) {
			return (
				<Circle
					size="xs"
					className="border-theme-secondary-300 dark:border-theme-secondary-800"
					noShadow
					data-testid="AddressRowMobile--nowallet"
				/>
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
								className="flex w-full items-center [&_svg]:hidden"
							>
								<AddressRowMobileDelegateName name={votes[0].wallet.username()} />
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
				<div
					className="overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800"
					onClick={() => {
						history.push(
							generatePath(ProfilePaths.WalletDetails, {
								profileId: activeProfile.id(),
								walletId: wallet.id(),
							}),
						);
					}}
				>
					<div className="overflow-hidden border-b border-theme-secondary-300 p-4 dark:border-theme-secondary-800">
						<div className="flex items-center justify-start space-x-3 overflow-hidden">
							<div className="flex w-0 flex-1 overflow-hidden">
								<Address address={wallet.address()} walletName={alias} showCopyButton />
							</div>
						</div>
					</div>

					<div className="flex">
						<div className="flex w-full flex-col bg-theme-secondary-100 p-4 dark:bg-black">
							<span className="font-semibold leading-[17px] text-theme-secondary-500">
								{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
							</span>
							<div className="mt-2 flex flex-grow items-center space-x-3 overflow-hidden leading-[17px]">
								{renderWalletVotes()}

								<Divider type="vertical" />

								{renderDelegateStatus(votes[0]?.wallet, wallet.network().delegateCount())}
							</div>
						</div>
						<Button
							disabled={!wallet.hasBeenFullyRestored() || !wallet.hasSyncedWithNetwork()}
							variant="secondary"
							className="space-x-0 rounded-none px-5 py-6"
							onClick={(e) => {
								e.stopPropagation();
								onSelect?.(wallet.address(), wallet.networkId());
							}}
							data-testid={`AddressRowMobile__select-${index}`}
						>
							{t("COMMON.VOTE")}
						</Button>
					</div>
				</div>
			</td>
		</tr>
	);
};
