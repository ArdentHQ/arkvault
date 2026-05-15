import { Contracts } from "@/app/lib/profiles";
import { twMerge } from "tailwind-merge";

const VISIBLE_TOKEN_COUNT = 3;

export const TokenNameInitials = ({ tokenName, className }: { tokenName: string; className?: string }) => (
	<div
		className={twMerge(
			"flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-theme-primary-600 text-xs font-semibold text-white dim:bg-theme-dim-navy-600 dark:bg-theme-dark-navy-600",
			className,
		)}
	>
		<div data-testid="TokeNameInitials">{tokenName.charAt(0).toUpperCase()}</div>
	</div>
);

export const TokensSummary = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => (
	<>
		<div data-testid="TokensSummary" className="flex items-center gap-1">
			<div className="flex h-6 items-center rounded-xl bg-theme-secondary-200 dim:bg-theme-dim-950 dark:bg-theme-dark-950">
				{wallet
					.profile()
					.tokens()
					.selected()
					.items()
					.toSorted((a, b) => b.balance().comparedTo(a.balance()))
					.slice(0, VISIBLE_TOKEN_COUNT)
					.toSorted((a, b) => a.token().name().localeCompare(b.token().name()))
					.map((walletToken, index) => (
						<div
							key={index}
							className="-ml-[5px] flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-theme-secondary-200 first:ml-0 dim:bg-theme-dim-950 dark:bg-theme-dark-950"
						>
							<TokenNameInitials tokenName={walletToken.token().name()} />
						</div>
					))}
			</div>

			{wallet.profile().tokens().selectedCount() > VISIBLE_TOKEN_COUNT && (
				<div
					data-testid="TokensSummary--Count"
					className="text-sm font-semibold leading-[17px] text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-dark-50 md:text-base md:leading-5"
				>
					+{wallet.profile().tokens().selectedCount() - VISIBLE_TOKEN_COUNT}
				</div>
			)}
		</div>
	</>
);
