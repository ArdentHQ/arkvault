import { Contracts } from "@/app/lib/profiles";
import React from "react";

import { Avatar } from "@/app/components/Avatar";
import { Size } from "@/types";

interface ProfileAvatarProperties {
	profile: Contracts.IProfile;
	size?: Size;
}

export const ProfileAvatar = ({ profile, size = "lg" }: ProfileAvatarProperties) =>
	profile.avatar().endsWith("</svg>") ? (
		<Avatar size={size} noShadow innerClassName="rounded">
			<img
				data-testid="ProfileAvatar__svg"
				src={`data:image/svg+xml;utf8,${encodeURIComponent(profile.avatar())}`}
				title={profile.name()}
				alt={profile.name()}
			/>
			<span className="absolute font-semibold text-white">{profile.name().slice(0, 2).toUpperCase()}</span>
		</Avatar>
	) : (
		<Avatar size={size} noShadow innerClassName="rounded">
			<img
				data-testid="ProfileAvatar__image"
				src={profile.avatar()}
				className="object-cover w-20 h-20 bg-center bg-no-repeat bg-cover rounded"
				title={profile.name()}
				alt={profile.name()}
			/>
		</Avatar>
	);
