import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Avatar } from "@/app/components/Avatar";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { NavigationBarMenuItem, UserMenuProperties } from "@/app/components/NavigationBar";
import { getUserMenuActions } from "@/app/constants/navigation";
import { useActiveProfile } from "@/app/hooks";
import { useConfiguration } from "@/app/contexts";
import { useProfileBalance } from "@/app/hooks/use-profile-balance";
import { Amount } from "@/app/components/Amount";
import { assertString } from "@/utils/assertions";
import { HideBalance } from "@/app/components/NavigationBar/components/HideBalance/HideBalance";
import { Contracts } from "@ardenthq/sdk-profiles";

export const UserMenu: FC<UserMenuProperties> = ({ onUserAction, avatarImage, userInitials }) => {
	const { t } = useTranslation();

	const userMenuActions = useMemo<(DropdownOption & NavigationBarMenuItem)[]>(() => getUserMenuActions(t), [t]);

	const profile = useActiveProfile();

	const { profileIsSyncingExchangeRates } = useConfiguration();
	const { convertedBalance } = useProfileBalance({ isLoading: profileIsSyncingExchangeRates, profile });
	const ticker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) || "USD";

	assertString(ticker);

	const renderAvatarSection = useCallback(
		(isOpen: boolean) => (
			<button className="group flex items-center gap-2 rounded bg-transparent p-0 px-1 py-0.5 hover:bg-theme-secondary-200 dark:hover:bg-theme-dark-700">
				<div className="hidden text-xs font-semibold leading-[17px] text-theme-secondary-700 group-hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:group-hover:text-theme-dark-50 md-lg:flex">
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
				<div className="flex items-center justify-between bg-theme-secondary-100 px-6 py-3 text-sm font-semibold leading-[17px] text-theme-secondary-700 dark:bg-theme-dark-950 dark:text-theme-dark-200 md-lg:hidden">
					<p>{t("COMMON.BALANCE")}:</p>
					<div className="flex items-center gap-2">
						<HideBalance className="md-lg:hidden" profile={profile} />
						<Amount value={convertedBalance} ticker={ticker} allowHideBalance />
					</div>
				</div>
			}
		/>
	);
};
