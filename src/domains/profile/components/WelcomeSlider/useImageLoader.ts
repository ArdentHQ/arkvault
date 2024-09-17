import { useCallback, useState } from "react";
import { isUnit } from "@/utils/test-helpers";

export const useImageLoader = ({
	onError,
	src,
}: {
	src?: string | null;
	onError?: () => void;
}): {
	isLoaded: boolean;
	isErrored: boolean;
	isLoading: boolean;
	loadImage: () => void;
} => {
	const [isLoaded, setIsImageLoaded] = useState(false);
	const [isErrored, setIsErrored] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const loadImage = useCallback(() => {
		if (isUnit()) {
			setIsLoading(false);
			setIsImageLoaded(true);
			return;
		}

		if (!src) {
			setIsLoading(false);
			setIsErrored(true);
			onError?.();
			return;
		}

		setIsLoading(true);

		const image = new Image();

		image.src = src;

		image.addEventListener("load", () => {
			setIsLoading(false);
			setIsImageLoaded(true);
		});

		// eslint-disable-next-line unicorn/prefer-add-event-listener
		image.onerror = () => {
			setIsErrored(true);
			setIsLoading(false);
			setIsImageLoaded(false);
			onError?.();
		};
	}, [onError, src]);

	return {
		isErrored,
		isLoaded,
		isLoading,
		loadImage,
	};
};
