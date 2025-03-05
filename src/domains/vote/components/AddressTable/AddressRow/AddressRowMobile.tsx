import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMediaQuery } from "react-responsive";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useWalletAlias } from "@/app/hooks";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Link } from "@/app/components/Link";
import { TruncateMiddle } from "@/app/components/TruncateMiddle";
import { WalletStatus } from "./AddressRow";
import classNames from "classnames";

interface AddressRowMobileProperties {
	index: number;
	maxVotes: number;
	wallet: Contracts.IReadWriteWallet;
	onSelect?: (walletAddress: string) => void;
}

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

	const renderWalletVotes = () => {
		if (!hasVotes) {
			return (
				<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-dark-500">
					{t("COMMON.NOT_AVAILABLE")}
				</span>
			);
		}

		if (!votes[0].wallet) {
			return (
				<span
					data-testid="AddressRowMobile--nowallet"
					className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-dark-500"
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
					className={classNames(
						"flex flex-col overflow-hidden rounded border border-theme-secondary-300 dark:border-theme-secondary-800",
						{},
					)}
				>
					<div className="flex justify-between overflow-hidden bg-theme-secondary-100 px-4 py-3 dark:bg-black">
						<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-text">
							{alias}
						</span>

						<div className="flex items-center gap-3">
							{votes[0]?.wallet && (
								<span className="block h-5 w-px bg-theme-secondary-300 dark:bg-theme-secondary-800 sm:hidden" />
							)}

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
						<div className="hidden grid-cols-1 gap-2 sm:grid">
							<div className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-dark-200">
								{t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VALIDATOR_STATUS")}
							</div>

							<div>
								<WalletStatus
									wallet={votes[0]?.wallet}
									activeDelegates={wallet.network().delegateCount()}
									fallback={
										<span className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-dark-500">
											{t("COMMON.NOT_AVAILABLE")}
										</span>
									}
								/>
							</div>
						</div>
					</div>
				</div>
			</td>
		</tr>
	);
};
