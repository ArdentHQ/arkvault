import { EmptyVotes, Votes } from "./WalletVote.blocks";

import { Button } from "@/app/components/Button";
import { Contracts } from "@/app/lib/profiles";
import { Icon } from "@/app/components/Icon";
import { Tooltip } from "@/app/components/Tooltip";
import { WalletVoteSkeleton } from "./WalletVoteSkeleton";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { useTranslation } from "react-i18next";
import { Divider } from "@/app/components/Divider";
import cn from "classnames";
import { TokensSummary } from "@/domains/portfolio/components/Tokens/TokensSummary";

interface WalletVoteProperties {
	wallet: Contracts.IReadWriteWallet | undefined;
	onButtonClick: () => void;
	votes: Contracts.VoteRegistryItem[];
	isLoadingVotes: boolean;
	wallets?: Contracts.IReadWriteWallet[];
	onViewTokens?: () => void;
	hasTokens?: boolean;
}

export const WalletVote = ({
	wallet,
	onButtonClick,
	votes,
	isLoadingVotes,
	wallets = [],
	onViewTokens,
	hasTokens,
}: WalletVoteProperties) => {
	const { t } = useTranslation();

	if (isLoadingVotes || !wallet) {
		return <WalletVoteSkeleton />;
	}

	const activeValidators = wallet.network().validatorCount();

	const renderVotes = (hasTokens: boolean = false) => {
		if (wallets.length > 1) {
			return (
				<div className="w-full">
					<p className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 px-[22px] pb-4 text-center text-base font-semibold md:mt-0 md:px-0 md:pb-0 md:text-left">
						{t("WALLETS.PAGE_WALLET_DETAILS.MANAGE_VOTES_FOR_YOUR_ADDRESSES")}
					</p>
				</div>
			);
		}

		if (votes.length === 0) {
			return (
				<>
					<EmptyVotes />
					{hasTokens && (
						<Divider
							type="vertical"
							className="border-theme-primary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 ml-3 h-5"
						/>
					)}
				</>
			);
		}

		return (
			<Votes votes={votes} activeValidators={activeValidators} withDivider={hasTokens} hasTokens={hasTokens} />
		);
	};

	const tooltipContent = () => {
		if (!wallet.balance()) {
			return t("COMMON.DISABLED_DUE_INSUFFICIENT_BALANCE");
		}

		return isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR");
	};

	return (
		<div
			data-testid="WalletVote"
			className="-mt-4 flex w-full flex-col items-center justify-between md:mt-0 md:flex-row md:items-center"
		>
			{hasTokens && (
				<div className="hidden items-center md:flex">
					<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 mr-1.5 leading-5 font-semibold">
						{t("COMMON.TOKEN_HOLDINGS")}
					</div>
					<TokensSummary wallet={wallet} />

					<Divider
						type="vertical"
						className="border-theme-primary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 ml-3 h-5"
					/>

					<Button
						data-testid="ViewTokens"
						variant="secondary-icon"
						className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent mt-4 hidden w-full whitespace-nowrap disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px] dark:disabled:bg-transparent"
						onClick={onViewTokens}
					>
						<span className="md-lg:inline hidden">{t("COMMON.VIEW_TOKENS")}</span>
						<span className="md-lg:hidden">{t("COMMON.VIEW")}</span>
					</Button>
				</div>
			)}

			<div
				className={cn("w-full", {
					"md:hidden": hasTokens,
				})}
			>
				{renderVotes()}
			</div>
			<div className="w-full md:w-auto md:max-md:self-end">
				{wallets.length > 1 && (
					<>
						<Button
							data-testid="WalletMyVotes__button"
							variant="secondary-icon"
							className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 dim:disabled:bg-transparent mt-4 hidden w-full space-x-2 whitespace-nowrap disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px] dark:disabled:bg-transparent"
							onClick={() => onButtonClick()}
						>
							<Icon className={cn({ "md-lg:block hidden": hasTokens })} name="Vote" />
							<span>{t("COMMON.MY_VOTES")}</span>
						</Button>

						<Button
							data-testid="WalletMyVotes__button_mobile"
							variant="secondary"
							className="text-theme-primary-600 dim:text-theme-dim-navy-600 w-full disabled:bg-transparent md:hidden dark:text-white dark:disabled:bg-transparent"
							onClick={() => onButtonClick()}
						>
							<Icon name="Vote" />
							<span>{t("COMMON.MY_VOTES")}</span>
						</Button>
					</>
				)}
				{wallets.length === 1 && (
					<div className="md:flex">
						<div className="hidden items-center md:flex"> {hasTokens && renderVotes(hasTokens)} </div>
						<Tooltip content={tooltipContent()}>
							<div>
								<Button
									data-testid="WalletVote__button"
									disabled={
										wallet.balance() === 0 ||
										(wallet.network().usesLockedBalance() &&
											wallet.balance("available") < wallet.network().votesAmountStep()) ||
										!wallet.hasBeenFullyRestored() ||
										!wallet.hasSyncedWithNetwork() ||
										!isLedgerWalletCompatible(wallet)
									}
									variant="secondary-icon"
									className="text-theme-primary-600 dark:text-theme-dark-navy-400 dim:text-theme-dim-navy-600 mt-4 hidden w-full space-x-2 disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px] dark:disabled:bg-transparent"
									onClick={() => onButtonClick()}
								>
									<Icon className={cn({ "md-lg:block hidden": hasTokens })} name="Vote" />
									<span>{t("COMMON.VOTE")}</span>
								</Button>

								<Button
									data-testid="WalletVote__button_mobile"
									disabled={
										wallet.balance().isZero() ||
										(wallet.network().usesLockedBalance() &&
											wallet
												.balance("available")
												.isLessThan(wallet.network().votesAmountStep())) ||
										!wallet.hasBeenFullyRestored() ||
										!wallet.hasSyncedWithNetwork() ||
										!isLedgerWalletCompatible(wallet)
									}
									variant="secondary"
									className="text-theme-primary-600 dim:text-theme-dim-navy-600 w-full disabled:bg-transparent md:hidden dark:text-white dark:disabled:bg-transparent"
									onClick={() => onButtonClick()}
								>
									<Icon name="Vote" />
									<span>{t("COMMON.VOTE")}</span>
								</Button>
							</div>
						</Tooltip>
					</div>
				)}
			</div>
		</div>
	);
};
