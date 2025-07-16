import { ProfileRow, ProfileRowSkeleton } from "@/domains/profile/components/ProfileRow/ProfileRow";
import Slider, { Settings } from "react-slick";
import { Contracts } from "@/app/lib/profiles";
import { DropdownOption } from "@/app/components/Dropdown";
import React, { JSX, useEffect, useRef, useState } from "react";
import { chunk } from "@/app/lib/helpers";

interface ProfilesSliderProperties {
	profiles: Contracts.IProfile[];
	actions: DropdownOption[];
	onClick: (profile: Contracts.IProfile) => void;
	onSelect: (profile: Contracts.IProfile, action: DropdownOption) => void;
}

const PROFILES_PER_SLIDE = 5;
const PROFILE_ROW_HEIGHT = 80;
const MIN_CONTAINER_HEIGHT = 150;
const HEIGHT_THRESHOLD = 700;

export const Profiles = (properties: ProfilesSliderProperties): JSX.Element => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [useScrollableView, setUseScrollableView] = useState(false);
	const [maxVisibleProfiles, setMaxVisibleProfiles] = useState(PROFILES_PER_SLIDE);

	useEffect(() => {
		const checkHeight = () => {
			/* istanbul ignore next -- @preserve */
			if (!containerRef.current) {
				return;
			}

			const viewportHeight = window.innerHeight;
			const shouldUseScrollableForHeight = viewportHeight < HEIGHT_THRESHOLD;

			if (shouldUseScrollableForHeight && properties.profiles.length > PROFILES_PER_SLIDE) {
				const containerRect = containerRef.current.getBoundingClientRect();
				const availableHeight = viewportHeight - containerRect.top - 120;

				const maxProfilesForHeight = Math.floor(
					Math.max(availableHeight, MIN_CONTAINER_HEIGHT) / PROFILE_ROW_HEIGHT,
				);
				const shouldUseScroll = properties.profiles.length > maxProfilesForHeight && maxProfilesForHeight >= 2;

				setMaxVisibleProfiles(Math.max(maxProfilesForHeight, 2));
				setUseScrollableView(shouldUseScroll);
			} else {
				setUseScrollableView(false);
			}
		};

		checkHeight();
		window.addEventListener("resize", checkHeight);

		return () => window.removeEventListener("resize", checkHeight);
	}, [properties.profiles.length]);

	const renderProfiles = () => {
		if (useScrollableView) {
			return <ScrollableProfiles {...properties} maxVisibleProfiles={maxVisibleProfiles} />;
		}

		if (properties.profiles.length <= PROFILES_PER_SLIDE) {
			return (
				<div className="space-y-3" data-testid="ProfileList">
					<ProfilesSlide {...properties} />
				</div>
			);
		}

		return <ProfilesSlider {...properties} />;
	};

	return <div ref={containerRef}>{renderProfiles()}</div>;
};

const ScrollableProfiles = ({
	profiles,
	actions,
	onClick,
	onSelect,
	maxVisibleProfiles,
}: ProfilesSliderProperties & { maxVisibleProfiles: number }) => {
	const scrollContainerHeight = maxVisibleProfiles * PROFILE_ROW_HEIGHT;

	return (
		<div
			className="scrollbar-thin scrollbar-thumb-theme-secondary-300 dark:scrollbar-thumb-theme-secondary-600 space-y-3 overflow-y-auto pr-2"
			style={{ maxHeight: `${scrollContainerHeight}px` }}
			data-testid="ScrollableProfileList"
		>
			{profiles.map((profile: Contracts.IProfile, index: number) => (
				<ProfileRow
					key={index}
					profile={profile}
					actions={actions}
					onClick={() => onClick(profile)}
					onSelect={(action) => onSelect(profile, action)}
				/>
			))}
		</div>
	);
};

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
			<button className="border-theme-navy-200 dark:border-theme-secondary-600 dark:hover:bg-theme-secondary-600 hover:bg-theme-navy-700 dim:border-theme-dim-200 dim-hover:border-theme-dim-navy-600 dim-hover:bg-theme-dim-navy-600 mt-3 h-3 w-3 rounded-full border-2 hover:border-transparent dark:hover:border-transparent" />
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
