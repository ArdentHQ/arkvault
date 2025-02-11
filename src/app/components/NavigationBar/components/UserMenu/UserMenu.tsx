import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Balance } from "@/app/components/NavigationBar/components/Balance";
import { Avatar } from "@/app/components/Avatar";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { NavigationBarMenuItem, UserMenuProperties } from "@/app/components/NavigationBar";
import { getUserMenuActions } from "@/app/constants/navigation";
import { useActiveProfile } from "@/app/hooks";
import { useConfiguration } from "@/app/contexts";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { useProfileBalance } from "@/app/hooks/use-profile-balance";
import { Amount } from "@/app/components/Amount";
import { Contracts } from "@ardenthq/sdk-profiles";
import { assertString } from "@/utils/assertions";
import { HideBalance } from "@/app/components/NavigationBar/components/HideBalance/HideBalance";


export const UserMenu: FC<UserMenuProperties> = ({ onUserAction, avatarImage, userInitials }) => {
	const { t } = useTranslation();

	const userMenuActions = useMemo<(DropdownOption & NavigationBarMenuItem)[]>(() => getUserMenuActions(t), [t]);

	const profile = useActiveProfile();

	const { profileIsSyncingExchangeRates } = useConfiguration();
	const { convertedBalance } = useProfileBalance({ isLoading: profileIsSyncingExchangeRates, profile });
	const ticker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);

	assertString(ticker);

	const renderAvatarSection = useCallback(
		(isOpen: boolean) => (
			<button className="flex items-center gap-2 p-0 bg-transparent group hover:bg-theme-secondary-200 rounded dark:hover:bg-theme-dark-700 px-1 py-0.5">
				<div className="text-xs leading-[17px] font-semibold text-theme-secondary-700 dark:text-theme-dark-200 group-hover:text-theme-secondary-900 dark:group-hover:text-theme-dark-50 hidden md-lg:flex">
					<Amount value={convertedBalance} ticker={ticker} allowHideBalance />
				</div>
				<div
					className="relative cursor-pointer items-center justify-center rounded-full align-middle"
					data-testid="UserMenu"
				>
					<Avatar size="avatarMobile" highlight={isOpen}>
						{avatarImage.endsWith("</svg>") ? (
							<>
								<img alt="Profile Avatar" src={`data:image/svg+xml;utf8,${avatarImage}`} />
								<span className="absolute text-xs font-semibold text-theme-background dark:text-theme-text">
									{userInitials}
								</span>
							</>
						) : (
							<img
								alt="Profile Avatar"
								className="h-6 w-6 rounded-full bg-cover bg-center bg-no-repeat object-cover"
								src={avatarImage}
							/>
						)}
					</Avatar>
				</div>
			</button>
		),
		[avatarImage, userInitials],
	);

	return (
		<Dropdown
			placement="bottom-end"
			onSelect={onUserAction}
			options={userMenuActions}
			toggleContent={renderAvatarSection}
			top={
				<div className="md-lg:hidden flex justify-between items-center text-theme-secondary-700 dark:text-theme-dark-200 leading-[17px] text-sm font-semibold py-3 px-6 bg-theme-secondary-100 dark:bg-theme-dark-950">
					<p>{t("COMMON.BALANCE")}:</p>
					<div className="flex items-center gap-2">
						<HideBalance className="md-lg:hidden" />
						<Amount value={convertedBalance} ticker={ticker} allowHideBalance />
					</div>
				</div>
			}
		/>
	);
};
