import cn from "classnames";
import { ProfileAvatar } from "@/domains/profile/components/ProfileAvatar";
import { Icon } from "@/app/components/Icon";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Skeleton } from "@/app/components/Skeleton";

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
		data-testid="ProfileRow"
		className={cn(
			"flex cursor-pointer items-center rounded-lg border border-theme-navy-200 leading-tight hover:border-theme-navy-300 hover:bg-theme-navy-50 dark:border-theme-secondary-800 dark:hover:border-theme-secondary-800 dark:hover:bg-theme-secondary-800",
			className,
		)}
	>
		<a
			data-testid="ProfileRow__Link"
			onClick={onClick}
			onKeyPress={onClick}
			className="flex min-w-0 flex-1 py-1 pl-1"
			tabIndex={1}
		>
			<div className="flex h-full w-full min-w-0 items-center justify-between">
				<div className="flex min-w-0 items-center">
					<ProfileAvatar profile={profile} size="md" />
					<span className="text-theme-primary-text inline-block truncate pl-3 font-semibold">
						{profile.name()}
					</span>
				</div>

				{profile.usesPassword() && (
					<Icon
						data-testid="Icon__Lock"
						name="Lock"
						className="border-r border-theme-secondary-300 pr-3 text-theme-secondary-900 dark:border-theme-secondary-800 dark:text-theme-secondary-200"
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
					<div
						className="group mr-2.5 flex cursor-pointer justify-center rounded-md p-1.5 hover:bg-theme-navy-200 dark:hover:bg-theme-secondary-700"
						tabIndex={1}
					>
						<Icon
							name="EllipsisVerticalFilled"
							className="text-theme-secondary-700 transition-colors duration-200 group-hover:text-theme-navy-700 dark:text-theme-secondary-600 dark:group-hover:text-theme-secondary-200"
							size="lg"
						/>
					</div>
				}
			/>
		</div>
	</div>
);

export const ProfileRowSkeleton = () => (
	<div
		data-testid="ProfileRowSkeleton"
		className="flex items-center justify-between rounded-lg border border-theme-secondary-200 p-1 dark:border-theme-secondary-800"
	>
		<div className="h-10 w-10 bg-theme-secondary-100 dark:bg-theme-secondary-800" />
		<Icon
			name="EllipsisVerticalFilled"
			className="mr-1.5 pr-1.5 text-theme-secondary-200 dark:text-theme-secondary-800"
			size="lg"
		/>
	</div>
);

export const ProfilesSliderSkeleton = ({ length = 5 }: { length?: number }) => {
	const maxProfilesPerPage = 5;
	const profilesPerPage = Math.min(maxProfilesPerPage, length);
	const skeletonRows = Array.from({ length: profilesPerPage }, () => 0);

	return (
		<div>
			<div className="space-y-3">
				{skeletonRows.map((_, index) => (
					<ProfileRowSkeleton key={index} />
				))}
			</div>
			{maxProfilesPerPage < length && (
				<div className="mt-3 flex h-3 justify-center gap-3 leading-3">
					<Skeleton className="h-3 w-3 rounded-full" />
					<Skeleton className="h-3 w-3 rounded-full" />
				</div>
			)}
		</div>
	);
};
