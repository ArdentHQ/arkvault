import React from "react";
import { Contracts } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import { Divider } from "@/app/components/Divider";
import { Button } from "@/app/components/Button";
import { t } from "i18next";

const VISIBLE_TOKEN_COUNT = 3;

const DefaultToken = ({ tokenName }: { tokenName: string }) => (
	<div className="bg-theme-primary-600 dark:bg-theme-dark-navy-600 dim:bg-theme-dim-navy-600 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full text-white">
		<span className="text-xs font-semibold">{tokenName.charAt(0).toUpperCase()}</span>
	</div>
);

export const TokensSummary = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	return (
		<>
			<div data-testid="TokensSummary" className="flex items-center gap-1">
				<div className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 flex h-6 items-center rounded-xl">
					{Array.from({ length: Math.min(VISIBLE_TOKEN_COUNT, wallet.tokenCount()) }).map((_, index) => (
						<div
							key={index}
							className="bg-theme-secondary-200 dark:bg-theme-dark-950 dim:bg-theme-dim-950 -ml-[5px] flex h-6 w-6 items-center justify-center overflow-hidden rounded-full first:ml-0"
						>
							<DefaultToken tokenName="Test Token" />
						</div>
					))}
				</div>

				{wallet.tokenCount() > VISIBLE_TOKEN_COUNT && (
					<div
						data-testid="TokensSummary--Count"
						className="text-theme-secondary-900 dark:text-theme-dark-50 dim:text-theme-dim-50 leading-5 font-semibold"
					>
						+{wallet.tokenCount() - VISIBLE_TOKEN_COUNT}
					</div>
				)}
			</div>
		</>
	);
};
