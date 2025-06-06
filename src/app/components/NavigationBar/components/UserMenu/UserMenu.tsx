import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Avatar } from "@/app/components/Avatar";
import { Dropdown, DropdownOptionGroup } from "@/app/components/Dropdown";
import { UserMenuProperties } from "@/app/components/NavigationBar";
import { getUserMenuActions } from "@/app/constants/navigation";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { useConfiguration } from "@/app/contexts";
import { useProfileBalance } from "@/app/hooks/use-profile-balance";
import { Amount } from "@/app/components/Amount";
import { assertString } from "@/utils/assertions";
import { HideBalance } from "@/app/components/NavigationBar/components/HideBalance/HideBalance";
import { SelectNetworkMobile } from "@/app/components/NavigationBar/components/SelectNetwork";
import { Contracts } from "@/app/lib/profiles";

export const UserMenu: FC<UserMenuProperties> = ({ onUserAction, avatarImage, userInitials }) => {
	const { t } = useTranslation();

	const userMenuActions = useMemo<DropdownOptionGroup[]>(() => getUserMenuActions(t), [t]);
	const { isXs } = useBreakpoint();

	const profile = useActiveProfile();

	const { profileIsSyncingExchangeRates } = useConfiguration().getProfileConfiguration(profile.id());
	const { convertedBalance } = useProfileBalance({ isLoading: profileIsSyncingExchangeRates, profile });
	const ticker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) || "USD";

	assertString(ticker);

	const showNetworkToggle = [isXs, !!profile.settings().get(Contracts.ProfileSetting.UseTestNetworks)].every(Boolean);

	const renderAvatarSection = useCallback(
		(isOpen: boolean) => (
			<button className="group dark:hover:bg-theme-dark-700 hover:bg-theme-secondary-200 dim-hover:bg-theme-dim-700 flex items-center gap-6 rounded bg-transparent p-0 px-1 py-0.5">
				<div
					className="relative cursor-pointer items-center justify-center rounded align-middle"
					data-testid="UserMenu"
				>
					<Avatar size="avatarMobile" highlight={isOpen}>
						{avatarImage.endsWith("</svg>") ? (
							<>
								<img
									alt="Profile Avatar"
									src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarImage)}`}
								/>
								<span className="text-theme-background dark:text-theme-text absolute text-xs font-semibold">
									{userInitials}
								</span>
							</>
						) : (
							<img
								alt="Profile Avatar"
								className="h-6 w-6 rounded bg-cover bg-center bg-no-repeat object-cover"
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
			variant="navbar"
			placement="bottom-end"
			onSelect={onUserAction}
			options={userMenuActions}
			toggleContent={renderAvatarSection}
			top={
				<div className="bg-theme-secondary-100 text-theme-secondary-700 md-lg:hidden dark:bg-theme-dark-950 dark:text-theme-dark-200 flex items-center justify-between px-6 py-3 text-sm leading-[17px] font-semibold">
					<p>{t("COMMON.BALANCE")}:</p>
					<div className="flex items-center gap-2">
						<HideBalance className="md-lg:hidden" profile={profile} />
						<Amount value={convertedBalance} ticker={ticker} allowHideBalance profile={profile} />
					</div>
				</div>
			}
			bottom={showNetworkToggle ? <SelectNetworkMobile profile={profile} /> : undefined}
		/>
	);
};
