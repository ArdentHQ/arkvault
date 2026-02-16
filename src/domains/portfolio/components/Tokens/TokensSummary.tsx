import { Contracts } from "@/app/lib/profiles";
import { twMerge } from "tailwind-merge";

const VISIBLE_TOKEN_COUNT = 3;

export const TokenNameInitials = ({ tokenName, className }: { tokenName: string; className?: string }) => (
	<div
		className={twMerge(
			"bg-theme-primary-600 dark:bg-theme-dark-navy-600 dim:bg-theme-dim-navy-600 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full text-xs font-semibold text-white",
			className,
		)}
	>
		<div data-testid="TokeNameInitials">{tokenName.charAt(0).toUpperCase()}</div>
	</div>
);

export const TokensSummary = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => (
	<>
		<div data-testid="TokensSummary" className="flex items-center gap-1">
			<div className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 flex h-6 items-center rounded-xl">
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
							className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 -ml-[5px] flex h-6 w-6 items-center justify-center overflow-hidden rounded-full first:ml-0"
						>
							<TokenNameInitials tokenName={walletToken.token().name()} />
						</div>
					))}
			</div>

			{wallet.profile().tokens().selectedCount() > VISIBLE_TOKEN_COUNT && (
				<div
					data-testid="TokensSummary--Count"
					className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 text-sm leading-[17px] font-semibold md:text-base md:leading-5"
				>
					+{wallet.profile().tokens().selectedCount() - VISIBLE_TOKEN_COUNT}
				</div>
			)}
		</div>
	</>
);
