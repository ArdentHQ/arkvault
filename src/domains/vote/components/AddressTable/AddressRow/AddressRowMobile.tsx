import { Contracts } from "@/app/lib/profiles";
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
import { MobileTableElement, MobileTableElementRow } from "@/app/components/MobileTableElement";
import { Tooltip } from "@/app/components/Tooltip";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";

interface AddressRowMobileProperties {
	index: number;
	maxVotes: number;
	wallet: Contracts.IReadWriteWallet;
	onSelect?: (walletAddress: string) => void;
}

export const AddressRowMobileValidatorName = ({ name }: { name?: string }) => {
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

	const hasVotes = useMemo(() => votes.length > 0, [votes]);

	const tooltipContent = () => {
		if (!wallet.balance()) {
			return t("COMMON.DISABLED_DUE_INSUFFICIENT_BALANCE");
		}

		return isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR");
	};

	const isButtonDisabled =
		!wallet.hasBeenFullyRestored() ||
		!wallet.hasSyncedWithNetwork() ||
		!wallet.balance() ||
		!isLedgerWalletCompatible(wallet);

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
				<span className="text-theme-secondary-500 dark:text-theme-dark-500 text-sm font-semibold">
					{t("COMMON.NOT_AVAILABLE")}
				</span>
			);
		}

		if (!votes[0].wallet) {
			return (
				<span
					data-testid="AddressRowMobile--nowallet"
					className="text-theme-secondary-500 dark:text-theme-dark-500 text-sm font-semibold"
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
								className="[&_svg]:text-theme-secondary-500 dark:[&_svg]:text-theme-dark-500 flex w-full items-center text-sm"
							>
								<AddressRowMobileValidatorName name={votes[0].wallet.address()} />
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
				<MobileTableElement
					title={alias}
					titleExtra={
						<div className="flex items-center gap-3">
							<WalletStatus
								dataTestId={`AddressRowMobile__wallet-status-${index}`}
								className="sm:hidden"
								wallet={votes[0]?.wallet}
								activeValidators={wallet.network().validatorCount()}
							/>

							{votes[0]?.wallet && (
								<span className="bg-theme-secondary-300 dark:bg-theme-secondary-800 dim:bg-theme-dim-700 block h-5 w-px sm:hidden" />
							)}

							<Tooltip content={tooltipContent()} placement="auto-end">
								<div>
									<Button
										disabled={isButtonDisabled}
										variant="transparent"
										onClick={(e) => {
											e.stopPropagation();
											onSelect?.(wallet.address());
										}}
										data-testid={`AddressRowMobile__select-${index}`}
										className="text-theme-primary-600 dark:hover:text-theme-primary-500 hover:text-theme-primary-700 p-0 text-sm hover:underline"
									>
										{t("COMMON.VOTE")}
									</Button>
								</div>
							</Tooltip>
						</div>
					}
					bodyClassName="sm:grid-cols-3"
				>
					<MobileTableElementRow title={t("COMMON.ADDRESS")}>
						<Address address={wallet.address()} size="sm" />
					</MobileTableElementRow>

					<MobileTableElementRow title={t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VOTING_FOR")}>
						{renderWalletVotes()}
					</MobileTableElementRow>

					<MobileTableElementRow
						title={t("WALLETS.PAGE_WALLET_DETAILS.VOTES.VALIDATOR_STATUS")}
						className="hidden sm:grid"
					>
						<WalletStatus
							wallet={votes[0]?.wallet}
							activeValidators={wallet.network().validatorCount()}
							fallback={
								<span className="text-theme-secondary-500 dark:text-theme-dark-500 text-sm font-semibold">
									{t("COMMON.NOT_AVAILABLE")}
								</span>
							}
						/>
					</MobileTableElementRow>
				</MobileTableElement>
			</td>
		</tr>
	);
};
