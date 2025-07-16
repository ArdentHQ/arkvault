import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Contracts } from "@/app/lib/profiles";
import { Icon } from "@/app/components/Icon";
import React from "react";
import { Tooltip } from "@/app/components/Tooltip";
import { twMerge } from "tailwind-merge";
import { useBalanceVisibility } from "@/app/hooks/use-balance-visibility";
import { useConfiguration } from "@/app/contexts";
import { useProfileBalance } from "@/app/hooks/use-profile-balance";
import { useTranslation } from "react-i18next";

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
			<Button
				variant="transparent"
				onClick={() => setHideBalance(!hideBalance)}
				className="group text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:bg-theme-dark-700 hover:bg-theme-secondary-200 dim:text-theme-dim-200 dim-hover:text-theme-dim-50 dim-hover:bg-theme-dim-700 flex flex-row items-center gap-2 rounded px-1 py-0.5"
				data-testid="HideBalance-button"
			>
				<Tooltip content={hideBalance ? t("COMMON.SHOW_BALANCE") : t("COMMON.HIDE_BALANCE")}>
					<div className="flex items-center justify-center">
						{hideBalance ? (
							<Icon name="EyeSlash" size="lg" data-testid="HideBalance-icon-hide" />
						) : (
							<Icon name="Eye" size="lg" data-testid="HideBalance-icon-show" />
						)}
					</div>
				</Tooltip>
				<div className="text-theme-secondary-700 md-lg:flex dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50 group-hover:text-theme-secondary-900 hidden text-sm leading-[17px] font-semibold">
					<Amount value={convertedBalance} ticker={ticker} allowHideBalance profile={profile} />
				</div>
			</Button>
		</div>
	);
};
