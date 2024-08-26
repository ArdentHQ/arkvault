import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Balance } from "@/app/components/NavigationBar/components/Balance";
import { Avatar } from "@/app/components/Avatar";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import { NavigationBarMenuItem, UserMenuProperties } from "@/app/components/NavigationBar";
import { getUserMenuActions } from "@/app/constants/navigation";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { useConfiguration } from "@/app/contexts";

export const UserMenu: FC<UserMenuProperties> = ({ onUserAction, avatarImage, userInitials }) => {
	const { t } = useTranslation();

	const userMenuActions = useMemo<(DropdownOption & NavigationBarMenuItem)[]>(() => getUserMenuActions(t), [t]);

	const profile = useActiveProfile();

	const { profileIsSyncingExchangeRates } = useConfiguration();
	const { isXs } = useBreakpoint();

	const renderAvatar = useCallback(
		(isOpen: boolean) => (
			<div
				className="relative cursor-pointer items-center justify-center rounded-full align-middle"
				data-testid="UserMenu"
			>
				<Avatar size={isXs ? "avatarMobile" :"lg"} highlight={isOpen}>
					{avatarImage.endsWith("</svg>") ? (
						<>
							<img alt="Profile Avatar" src={`data:image/svg+xml;utf8,${avatarImage}`} />
							<span className="absolute text-sm font-semibold text-theme-background dark:text-theme-text">
								{userInitials}
							</span>
						</>
					) : (
						<img
							alt="Profile Avatar"
							className="h-[25px] w-[25px] sm:h-11 sm:w-11 rounded-full bg-cover bg-center bg-no-repeat object-cover"
							src={avatarImage}
						/>
					)}
				</Avatar>
			</div>
		),
		[avatarImage, userInitials],
	);

	return (
		<Dropdown
			onSelect={onUserAction}
			options={userMenuActions}
			dropdownClass="mt-8 mx-4 sm:mx-0 overflow-hidden"
			toggleContent={renderAvatar}
			top={
				<div className="md:hidden">
					<Balance profile={profile} isLoading={profileIsSyncingExchangeRates} />
				</div>
			}
		/>
	);
};
