import { Contracts } from "@ardenthq/sdk-profiles";
import { generatePath } from "react-router";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMediaQuery } from "react-responsive";
import { Avatar } from "@/app/components/Avatar";
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
			<Icon name={icon} className={color} size="lg" data-testid="StatusIcon__icon" />
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

export const AddressRowMobile = ({ index, maxVotes, wallet, onSelect }: AddressRowMobileProperties) => {
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const { profileHasSyncedOnce, profileIsSyncingWallets } = useConfiguration();
	const navigate = useNavigate();

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

	const [first, second, third, ...rest] = votes;

	const renderAvatar = (address?: string, username?: string) => (
		<Tooltip content={username}>
			<span className="flex">
				<Avatar className="ring-2 ring-theme-background" size="xs" address={address} noShadow />
			</span>
		</Tooltip>
	);

	const renderRestOfVotes = (restOfVotes: number) => {
		const rest = (
			<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-600">
				+{restOfVotes}
			</span>
		);

		return <div className="pl-3">{rest}</div>;
	};

	const renderDelegateStatus = (wallet: Contracts.IReadOnlyWallet | undefined, activeDelegates: number) => {
		if (!wallet) {
			return (
				<Circle
					size="xs"
					className="shrink-0 border-theme-secondary-300 dark:border-theme-secondary-800"
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

		return <StatusIcon label={t("WALLETS.STATUS.ACTIVE")} icon="CircleCheckMark" color="text-theme-success-600" />;
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

		if (maxVotes === 1) {
			return (
				<>
					<Avatar size="xs" address={votes[0].wallet.address()} noShadow />

					{votes[0].wallet && (
						<div className="flex items-center">
							<div className="flex flex-1 justify-end overflow-hidden">
								<Link
									isExternal
									to={votes[0].wallet.explorerLink()}
									className="flex w-full items-center"
								>
									<AddressRowMobileDelegateName name={votes[0].wallet.username()} />
								</Link>
							</div>
						</div>
					)}
				</>
			);
		}

		return (
			<div className="flex items-center -space-x-1">
				{renderAvatar(first.wallet?.address(), first.wallet?.username())}

				{second && renderAvatar(second.wallet?.address(), second.wallet?.username())}

				{third && renderAvatar(third.wallet?.address(), third.wallet?.username())}

				{rest && rest.length === 1 && renderAvatar(rest[0].wallet?.address(), rest[0].wallet?.username())}

				{rest && rest.length > 1 && renderRestOfVotes(rest.length)}
			</div>
		);
	};

	return (
		<tr data-testid="AddressRowMobile">
			<td className="pt-3">
				<div
					className="overflow-hidden rounded-xl border border-theme-secondary-300 dark:border-theme-secondary-800"
					onClick={() => {
						navigate(
							generatePath(ProfilePaths.WalletDetails, {
								profileId: activeProfile.id(),
								walletId: wallet.id(),
							}),
						);
					}}
				>
					<div className="overflow-hidden border-b border-theme-secondary-300 px-6 py-4 dark:border-theme-secondary-800">
						<div className="flex items-center justify-start space-x-3 overflow-hidden">
							<Avatar className="shrink-0" size="xs" address={wallet.address()} noShadow />

							<div className="flex w-0 flex-1 overflow-hidden">
								<Address address={wallet.address()} walletName={alias} />
							</div>
						</div>
					</div>

					<div className="flex">
						<div className="flex w-full flex-col bg-theme-secondary-100 px-6 py-4 dark:bg-black">
							<span className="text-theme-secondary-500">
								{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}
							</span>
							<div className="flex flex-grow items-center space-x-2 overflow-hidden">
								{renderWalletVotes()}

								<Divider type="vertical" />

								{renderDelegateStatus(votes[0]?.wallet, wallet.network().delegateCount())}
							</div>
						</div>
						<Button
							disabled={!wallet.hasBeenFullyRestored() || !wallet.hasSyncedWithNetwork()}
							variant="secondary"
							sizeClassName="p-6"
							roundedClassName="rounded-none"
							onClick={() => onSelect?.(wallet.address(), wallet.networkId())}
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
