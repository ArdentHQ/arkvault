import { useImageLoader } from "@/domains/profile/components/WelcomeSlider/useImageLoader";
import React, { useLayoutEffect, useMemo } from "react";
import { useAccentColor as useAccentColorHook, useTheme } from "@/app/hooks";
import { images } from "@/app/assets/images";
import { twMerge } from "tailwind-merge";

interface ImageWithPlaceholderProperties {
	domain: string;
	name: string;
	useAccentColor?: boolean;
	fallbackImages: Record<"light" | "dark", string>;
	wrapperClassName?: string;
	imageClassName?: string;
	alt?: string;
}

export const ImageWithPlaceholder = ({
	domain,
	name,
	wrapperClassName,
 	imageClassName,
	useAccentColor,
	fallbackImages,
	alt,
}: ImageWithPlaceholderProperties) => {
	const src = useImagePath({ domain, name, useAccentColor });

	const { isLoading, isLoaded, isErrored, loadImage } = useImageLoader({ src });
	const { isDarkMode } = useTheme();

	useLayoutEffect(() => {
		setTimeout(() => {
			loadImage();
		}, 3000);
	}, [loadImage]);

	console.log({ name, isErrored, isLoaded, isLoading });

	if (isLoaded) {
		return <img src={src} alt={alt} className={imageClassName} />;
	}

	return (
		<div className={twMerge("h-full w-full", wrapperClassName)}>
			<img alt={alt} className="h-full w-full" src={isDarkMode ? fallbackImages.dark : fallbackImages.light} />
		</div>
	);
};

const useImagePath = ({
	name,
	domain,
	useAccentColor = true,
}: {
	name: string;
	domain: string;
	useAccentColor?: boolean;
}) => {
	const { isDarkMode } = useTheme();

	const { getCurrentAccentColor } = useAccentColorHook();
	const currentAccentColor = getCurrentAccentColor();

	const imageName = useMemo(() => {
		let imageName: string = name;

		if (isDarkMode) {
			imageName = `${imageName}Dark`;
		} else {
			imageName = `${imageName}Light`;
		}

		if (useAccentColor) {
			const theme: string = currentAccentColor.charAt(0).toUpperCase() + currentAccentColor.slice(1);
			imageName = `${imageName}${theme}`;
		}

		return imageName;
	}, [name, isDarkMode, useAccentColor, currentAccentColor]);

	return ((images as any)[domain][imageName] || (images as any)[domain][name]) as string;
};
