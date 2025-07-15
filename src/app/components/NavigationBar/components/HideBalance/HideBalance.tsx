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
  
  const isMobile = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <div className={twMerge("m-0 flex items-center gap-2 space-x-0", className)}>
      <Tooltip 
        content={hideBalance ? t("COMMON.SHOW_BALANCE") : t("COMMON.HIDE_BALANCE")}
        disabled={isMobile}
      >
        <Button
          variant="transparent"
          onClick={() => setHideBalance(!hideBalance)}
          className="group text-theme-secondary-700 dark:text-theme-dark-200 dark:hover:bg-theme-dark-700 hover:bg-theme-secondary-200 dim:text-theme-dim-200 dim-hover:text-theme-dim-50 dim-hover:bg-theme-dim-700 flex flex-row items-center gap-2 rounded px-1 py-0.5"
          data-testid="HideBalance-button"
        >
          <div className="flex items-center justify-center">
            {hideBalance ? (
              <Icon name="EyeSlash" size="lg" data-testid="HideBalance-icon-hide" />
            ) : (
              <Icon name="Eye" size="lg" data-testid="HideBalance-icon-show" />
            )}
          </div>
		  {

		  }
          <div className="text-theme-secondary-700 md-lg:flex dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50 group-hover:text-theme-secondary-900 hidden text-sm leading-[17px] font-semibold">
            <Amount value={convertedBalance} ticker={ticker} allowHideBalance profile={profile} />
          </div>
        </Button>
      </Tooltip>
    </div>
  );
};