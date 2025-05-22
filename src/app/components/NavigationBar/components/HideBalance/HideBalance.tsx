import React from "react";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";
import { Button } from "@/app/components/Button";
import { useBalanceVisibility } from "@/app/hooks/use-balance-visibility";
import { Contracts } from "@/app/lib/profiles";
import { Amount } from "@/app/components/Amount";
import { useProfileBalance } from "@/app/hooks/use-profile-balance";
import { useConfiguration } from "@/app/contexts";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/app/components/Tooltip";
export const HideBalance = ({ profile, className }: { profile: Contracts.IProfile; className?: string }) => {
	const { hideBalance, setHideBalance } = useBalanceVisibility({ profile });
	const { profileIsSyncingExchangeRates } = useConfiguration().getProfileConfiguration(profile.id());
	const { convertedBalance } = useProfileBalance({
		isLoading: profileIsSyncingExchangeRates,
		profile,
	});
	const ticker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) || "USD";
	const { t } = useTranslation();

	return (
		<div className={twMerge("m-0 flex items-center gap-2 space-x-0", className)}>
			<Tooltip content={hideBalance ? t("COMMON.SHOW_BALANCE") : t("COMMON.HIDE_BALANCE")}>
				<Button
					variant="transparent"
					onClick={() => setHideBalance(!hideBalance)}
					className="flex flex-row gap-2 items-center py-0.5 px-1 rounded group text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:bg-theme-dark-700 hover:bg-theme-secondary-200"
					data-testid="HideBalance-button"
				>
					{hideBalance ? (
						<Icon name="EyeSlash" size="lg" data-testid="HideBalance-icon-hide" />
					) : (
						<Icon name="Eye" size="lg" data-testid="HideBalance-icon-show" />
					)}

					<div className="hidden text-sm font-semibold text-theme-secondary-700 leading-[17px] md-lg:flex dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50 group-hover:text-theme-secondary-900">
						<Amount value={convertedBalance} ticker={ticker} allowHideBalance profile={profile} />
					</div>
				</Button>
			</Tooltip>
		</div>
	);
};
