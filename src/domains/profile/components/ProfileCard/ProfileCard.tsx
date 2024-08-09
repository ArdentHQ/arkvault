import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React from "react";

import { Badge } from "@/app/components/Badge";
import { Card } from "@/app/components/Card";
import { DropdownOption } from "@/app/components/Dropdown";
import { ProfileAvatar } from "@/domains/profile/components/ProfileAvatar";
import { Icon } from "@/app/components/Icon";

interface ProfileCardProperties {
	actions?: DropdownOption[];
	className?: string;
	profile: Contracts.IProfile;
	showSettings?: boolean;
	onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
	onSelect?: (option: DropdownOption) => void;
}

export const ProfileCard = ({
	actions,
	className,
	profile,
	showSettings = true,
	onClick,
	onSelect,
}: ProfileCardProperties) => (
	<Card
		variant="primary"
		className={cn("h-40 w-36 leading-tight sm:w-40", className)}
		onClick={onClick}
		actions={showSettings ? actions : undefined}
		onSelect={onSelect}
	>
		<div className="mx-auto flex h-full flex-col items-center justify-center">
			<div className="relative">
				<ProfileAvatar profile={profile} size="xl" />
				{profile.usesPassword() && (
					<Badge
						className="mb-2 mr-2 border-theme-background bg-theme-background text-theme-secondary-900 dark:text-theme-secondary-600"
						icon="Lock"
						iconSize="lg"
						size="lg"
						position="bottom-right"
					/>
				)}
			</div>

			<span className="text-theme-primary-text mt-3 max-w-32 truncate font-semibold">{profile.name()}</span>
		</div>
	</Card>
);

export const ProfileCard2 = ({
	actions,
	className,
	profile,
	showSettings = true,
	onClick,
	onSelect,
}: ProfileCardProperties) => (
	<Card
		variant="primary"
		className={cn("leading-tight", className)}
		onClick={onClick}
		actions={showSettings ? actions : undefined}
		onSelect={onSelect}
		buttonClassName="!p-1 !pr-4 flex items-center"
	>
		<div className="mr-6 flex h-full w-full min-w-0 items-center justify-between">
			<div className="flex min-w-0 items-center">
				<ProfileAvatar profile={profile} size="md" />
				<span className="text-theme-primary-text inline-block truncate pl-3 font-semibold">
					{profile.name()}
				</span>
			</div>

			{profile.usesPassword() && (
				<Icon
					name="Lock"
					className="-mr-1 border-r border-theme-secondary-300 pr-3 text-theme-secondary-900 dark:border-theme-secondary-800 dark:text-theme-secondary-600"
					size="lg"
				/>
			)}
		</div>
	</Card>
);
