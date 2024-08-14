import { Contracts } from "@ardenthq/sdk-profiles";
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
				src={`data:image/svg+xml;utf8,${profile.avatar()}`}
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
				className="h-20 w-20 rounded bg-cover bg-center bg-no-repeat object-cover"
				title={profile.name()}
				alt={profile.name()}
			/>
		</Avatar>
	);
