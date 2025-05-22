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
			<button className="flex gap-6 items-center p-0 py-0.5 px-1 bg-transparent rounded group dark:hover:bg-theme-dark-700 hover:bg-theme-secondary-200">
				<div
					className="relative justify-center items-center align-middle rounded cursor-pointer"
					data-testid="UserMenu"
				>
					<Avatar size="avatarMobile" highlight={isOpen}>
						{avatarImage.endsWith("</svg>") ? (
							<>
								<img
									alt="Profile Avatar"
									src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarImage)}`}
								/>
								<span className="absolute text-xs font-semibold text-theme-background dark:text-theme-text">
									{userInitials}
								</span>
							</>
						) : (
							<img
								alt="Profile Avatar"
								className="object-cover w-6 h-6 bg-center bg-no-repeat bg-cover rounded"
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
				<div className="flex justify-between items-center py-3 px-6 text-sm font-semibold bg-theme-secondary-100 text-theme-secondary-700 leading-[17px] md-lg:hidden dark:bg-theme-dark-950 dark:text-theme-dark-200">
					<p>{t("COMMON.BALANCE")}:</p>
					<div className="flex gap-2 items-center">
						<HideBalance className="md-lg:hidden" profile={profile} />
						<Amount value={convertedBalance} ticker={ticker} allowHideBalance profile={profile} />
					</div>
				</div>
			}
			bottom={showNetworkToggle ? <SelectNetworkMobile profile={profile} /> : undefined}
		/>
	);
};
