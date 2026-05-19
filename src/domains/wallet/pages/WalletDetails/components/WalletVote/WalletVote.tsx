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
					<p className="px-[22px] pb-4 text-center text-base font-semibold text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200 md:mt-0 md:px-0 md:pb-0 md:text-left">
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
							className="ml-3 h-5 border-theme-primary-300 dim:border-theme-dim-700 dark:border-theme-dark-700"
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
		if (wallet.balance().isZero()) {
			return t("COMMON.DISABLED_DUE_INSUFFICIENT_BALANCE");
		}

		if (!isLedgerWalletCompatible(wallet)) {
			return t("COMMON.LEDGER_COMPATIBILITY_ERROR");
		}
	};

	return (
		<div
			data-testid="WalletVote"
			className="-mt-4 flex w-full flex-col items-center justify-between md:mt-0 md:flex-row md:items-center"
		>
			{hasTokens && (
				<div className="hidden items-center md:flex">
					<div className="mr-1.5 font-semibold leading-5 text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-dark-200">
						{t("COMMON.TOKEN_HOLDINGS")}
					</div>
					<TokensSummary wallet={wallet} />

					<Divider
						type="vertical"
						className="ml-3 h-5 border-theme-primary-300 dim:border-theme-dim-700 dark:border-theme-dark-700"
					/>

					<Button
						data-testid="ViewTokens"
						variant="secondary-icon"
						className="mt-4 hidden w-full whitespace-nowrap text-theme-primary-600 disabled:bg-transparent dim:text-theme-dim-navy-600 dim:disabled:bg-transparent dark:text-theme-dark-navy-400 dark:disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px]"
						onClick={onViewTokens}
					>
						<span className="hidden md-lg:inline">{t("COMMON.VIEW_TOKENS")}</span>
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
			<div className="md:max-md:self-end w-full md:w-auto">
				{wallets.length > 1 && (
					<>
						<Button
							data-testid="WalletMyVotes__button"
							variant="secondary-icon"
							className="mt-4 hidden w-full space-x-2 whitespace-nowrap text-theme-primary-600 disabled:bg-transparent dim:text-theme-dim-navy-600 dim:disabled:bg-transparent dark:text-theme-dark-navy-400 dark:disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px]"
							onClick={() => onButtonClick()}
						>
							<Icon className={cn({ "hidden md-lg:block": hasTokens })} name="Vote" />
							<span>{t("COMMON.MY_VOTES")}</span>
						</Button>

						<Button
							data-testid="WalletMyVotes__button_mobile"
							variant="secondary"
							className="w-full text-theme-primary-600 disabled:bg-transparent dim:text-theme-dim-navy-600 dark:text-white dark:disabled:bg-transparent md:hidden"
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
										wallet.balance().isZero() ||
										(wallet.network().usesLockedBalance() &&
											wallet
												.balance("available")
												.isLessThan(wallet.network().votesAmountStep())) ||
										!wallet.hasBeenFullyRestored() ||
										!wallet.hasSyncedWithNetwork() ||
										!isLedgerWalletCompatible(wallet)
									}
									variant="secondary-icon"
									className="mt-4 hidden w-full space-x-2 text-theme-primary-600 disabled:bg-transparent dim:text-theme-dim-navy-600 dark:text-theme-dark-navy-400 dark:disabled:bg-transparent md:mt-0 md:flex md:w-auto md:px-2 md:py-[3px]"
									onClick={() => onButtonClick()}
								>
									<Icon className={cn({ "hidden md-lg:block": hasTokens })} name="Vote" />
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
									className="w-full text-theme-primary-600 disabled:bg-transparent dim:text-theme-dim-navy-600 dark:text-white dark:disabled:bg-transparent md:hidden"
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
