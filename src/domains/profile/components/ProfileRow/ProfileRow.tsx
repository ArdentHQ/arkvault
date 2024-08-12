import cn from "classnames";
import { ProfileAvatar } from "@/domains/profile/components/ProfileAvatar";
import { Icon } from "@/app/components/Icon";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";

interface ProfileRowProperties {
	actions?: DropdownOption[];
	className?: string;
	profile: Contracts.IProfile;
	showSettings?: boolean;
	onClick?: () => void;
	onSelect?: (option: DropdownOption) => void;
}

export const ProfileRow = ({ actions, className, profile, onClick, onSelect }: ProfileRowProperties) => (
	<div
		className={cn(
			"flex items-center rounded-lg border border-theme-navy-200 p-1 leading-tight hover:border-theme-navy-300 hover:bg-theme-navy-50 dark:border-theme-secondary-800 dark:hover:border-theme-secondary-900 dark:hover:bg-theme-secondary-600",
			className,
		)}
	>
		<a onClick={onClick} onKeyPress={onClick} className="flex min-w-0 flex-1" tabIndex={1}>
			<div className="flex h-full w-full min-w-0 items-center justify-between">
				<div className="flex min-w-0 items-center">
					<ProfileAvatar profile={profile} size="md" />
					<span className="text-theme-primary-text inline-block truncate pl-3 font-semibold">
						{profile.name()}
					</span>
				</div>

				{profile.usesPassword() && (
					<Icon
						name="Lock"
						className="border-r border-theme-secondary-300 pr-3 text-theme-secondary-900 dark:border-theme-secondary-800 dark:text-theme-secondary-600"
						size="lg"
					/>
				)}
			</div>
		</a>

		<div className="relative">
			<Dropdown
				position="top-right"
				options={actions}
				onSelect={onSelect}
				toggleContent={
					<div className="mr-1.5 flex justify-center rounded-md p-1.5 hover:bg-theme-navy-200" tabIndex={1}>
						<Icon
							name="EllipsisVerticalFilled"
							className="cursor-pointer text-theme-secondary-700 transition-colors duration-200 hover:text-theme-navy-700 dark:text-theme-secondary-600 dark:hover:text-theme-secondary-200"
							size="lg"
						/>
					</div>
				}
			/>
		</div>
	</div>
);

export const ProfileRowSkeleton = () => (
	<div className="flex items-center justify-between rounded-lg border border-theme-secondary-200 p-1 dark:border-theme-secondary-800">
		<div className="h-10 w-10 bg-theme-secondary-100" />
		<Icon
			name="EllipsisVerticalFilled"
			className="mr-1.5 pr-1.5 text-theme-secondary-200 dark:text-theme-secondary-600"
			size="lg"
		/>
	</div>
);
