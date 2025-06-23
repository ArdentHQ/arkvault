import { ProfileRow, ProfileRowSkeleton } from "@/domains/profile/components/ProfileRow/ProfileRow";
import Slider, { Settings } from "react-slick";

import { Contracts } from "@/app/lib/profiles";
import { DropdownOption } from "@/app/components/Dropdown";
import React, { JSX } from "react";
import { chunk } from "@/app/lib/helpers";

interface ProfilesSliderProperties {
	profiles: Contracts.IProfile[];
	actions: DropdownOption[];
	onClick: (profile: Contracts.IProfile) => void;
	onSelect: (profile: Contracts.IProfile, action: DropdownOption) => void;
}

const PROFILES_PER_SLIDE = 5;

export const Profiles = (properties: ProfilesSliderProperties): JSX.Element =>
	properties.profiles.length <= PROFILES_PER_SLIDE ? (
		<div className="space-y-3" data-testid="ProfileList">
			<ProfilesSlide {...properties} />
		</div>
	) : (
		<ProfilesSlider {...properties} />
	);

const ProfilesSlide = ({ profiles, actions, onClick, onSelect }: ProfilesSliderProperties) => (
	<>
		{profiles.map((profile: Contracts.IProfile, index: number) => (
			<ProfileRow
				key={index}
				profile={profile}
				actions={actions}
				onClick={() => onClick(profile)}
				onSelect={(action) => onSelect(profile, action)}
			/>
		))}
	</>
);

const ProfilesSlider = (properties: ProfilesSliderProperties) => {
	const settings: Settings = {
		appendDots: (dots) => (
			<div>
				<ul className="flex justify-center gap-3 leading-3"> {dots} </ul>
			</div>
		),
		arrows: false,
		autoplay: false,
		customPaging: () => (
			<button className="border-theme-navy-200 dark:border-theme-secondary-600 dark:hover:bg-theme-secondary-600 hover:bg-theme-navy-700 mt-3 h-3 w-3 rounded-full border-2 hover:border-transparent dark:hover:border-transparent" />
		),
		dots: true,
		dotsClass: "welcome-slider-dots",
		draggable: false,
		infinite: true,
		slidesToScroll: 1,
		slidesToShow: 1,
		speed: 500,
	};

	const { profiles, ...rest } = properties;
	const profileChunks = chunk(profiles, PROFILES_PER_SLIDE);

	return (
		<div data-testid="ProfileSlider">
			<Slider {...settings}>
				{profileChunks.map((profilesInChunk: Contracts.IProfile[], index) => (
					<div className="space-y-3" key={index}>
						<ProfilesSlide profiles={profilesInChunk} {...rest} />
						{Array.from({ length: PROFILES_PER_SLIDE - profilesInChunk.length }).map((_, key) => (
							<ProfileRowSkeleton key={key} />
						))}
					</div>
				))}
			</Slider>
		</div>
	);
};
