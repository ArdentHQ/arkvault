import cn from "classnames";
import { ProfileAvatar } from "@/domains/profile/components/ProfileAvatar";
import { Icon } from "@/app/components/Icon";
import { Dropdown, DropdownOption } from "@/app/components/Dropdown";
import React from "react";
import { Contracts } from "@/app/lib/profiles";
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
			"border-theme-primary-200 transition-colors-shadow hover:border-theme-primary-100 hover:bg-theme-primary-100 dark:border-theme-secondary-800 dark:hover:border-theme-secondary-800 dark:hover:bg-theme-secondary-800 flex cursor-pointer items-center rounded-lg border leading-tight duration-100 ease-linear",
			className,
		)}
	>
		<a
			data-testid="ProfileRow__Link"
			onClick={onClick}
			onKeyPress={onClick}
			className="flex flex-1 py-1 pl-1 min-w-0"
			tabIndex={1}
		>
			<div className="flex justify-between items-center w-full min-w-0 h-full">
				<div className="flex items-center min-w-0">
					<ProfileAvatar profile={profile} size="md" />
					<span className="inline-block pl-3 font-semibold text-theme-primary-text truncate">
						{profile.name()}
					</span>
				</div>

				{profile.usesPassword() && (
					<Icon
						data-testid="Icon__Lock"
						name="Lock"
						className="pr-3 border-r border-theme-secondary-300 text-theme-secondary-900 dark:border-theme-secondary-800 dark:text-theme-secondary-200"
						size="lg"
					/>
				)}
			</div>
		</a>

		<div className="relative">
			<Dropdown
				placement="bottom-end"
				options={actions}
				onSelect={onSelect}
				toggleContent={
					<div
						className="flex justify-center p-1.5 mr-2.5 rounded-md cursor-pointer group dark:hover:bg-theme-secondary-700 hover:bg-theme-navy-200"
						tabIndex={1}
					>
						<Icon
							name="EllipsisVerticalFilled"
							className="transition-colors duration-200 text-theme-secondary-700 dark:text-theme-secondary-600 dark:group-hover:text-theme-secondary-200 group-hover:text-theme-navy-700"
							size="md"
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
		className="flex justify-between items-center p-1 rounded-lg border border-theme-secondary-200 dark:border-theme-secondary-800"
	>
		<div className="w-10 h-10 bg-theme-secondary-100 dark:bg-theme-secondary-800" />
		<Icon
			name="EllipsisVerticalFilled"
			className="pr-1.5 mr-1.5 transition-colors duration-200 text-theme-secondary-700 dark:text-theme-secondary-600 dark:group-hover:text-theme-secondary-200 group-hover:text-theme-navy-700"
			size="md"
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
				<div className="flex gap-3 justify-center mt-3 h-3 leading-3">
					<Skeleton className="w-3 h-3 rounded-full" />
					<Skeleton className="w-3 h-3 rounded-full" />
				</div>
			)}
		</div>
	);
};
