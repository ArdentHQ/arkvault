import { useMediaQuery } from "react-responsive";

export const useBreakpoint = () => {
	const isXs = useMediaQuery({ maxWidth: 639 });
	const isSm = useMediaQuery({ maxWidth: 767, minWidth: 640 });
	const isMd = useMediaQuery({ maxWidth: 1023, minWidth: 768 });
	const isLg = useMediaQuery({ maxWidth: 1279, minWidth: 1024 });
	const isXl = useMediaQuery({ minWidth: 1280 });

	const isSmAndAbove = !isXs;
	const isMdAndAbove = isSmAndAbove && !isSm;
	const isLgAndAbove = isMdAndAbove && !isMd;

	return {
		isLg,
		isLgAndAbove,
		isMd,
		isMdAndAbove,
		isSm,
		isSmAndAbove,
		isXl,
		isXs,
	};
};
