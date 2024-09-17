import React, {useLayoutEffect, useRef, useState} from "react";
import { Image } from "@/app/components/Image";
import Slider, { Settings } from "react-slick";

interface SlideProperties {
	title: string;
	subtitle: string;
	imageName: string;
	imageNameSm: string;
}

const Slide = ({ title, subtitle, imageName, imageNameSm }: SlideProperties) => {
	const [height, setHeight] = useState<number|undefined>();
	const containerRef = useRef<HTMLDivElement>()

	useLayoutEffect(() => {
		const w = containerRef.current?.offsetWidth ?? 0
		const originalHeight = 938
		const originalWidth = 1029

		const newHeight = (originalHeight / originalWidth) * w
		console.log(newHeight)
		setHeight(newHeight)
	}, []);

	return (<div className="flex w-full flex-row md:w-auto lg:flex-col">
		<div className="w-full p-4 sm:flex-shrink-0 sm:p-6 md:w-[360px] md:pb-0 md:pr-0 lg:w-[430px]">
			<h3 className="mb-2 mt-7 text-base leading-7 xs:leading-5 md:font-bold lg:text-2xl lg:leading-[29px]">
				{title}
			</h3>
			<p className="mb-0 text-sm text-theme-secondary-700 dark:text-theme-secondary-500 md:mb-4 lg:text-base lg:leading-7">
				{subtitle}
			</p>
		</div>
		<div className="hidden flex-1 justify-end overflow-hidden rounded-ee-xl md:flex" ref={containerRef} style={{minHeight: height}}>
			<Image name={imageName} alt={title} domain="profile" className="!hidden lg:!block" />
			<Image
				name={imageNameSm}
				alt={title}
				domain="profile"
				className="mt-3 !hidden h-[180px] md:!block lg:!hidden"
			/>
		</div>
	</div>)
};

export const WelcomeSlider = (): JSX.Element => {
	const settings: Settings = {
		appendDots: (dots) => (
			<div>
				<ul className="flex gap-3 leading-3"> {dots} </ul>
			</div>
		),
		arrows: false,
		autoplay: false,
		customPaging: () => (
			<button className="h-3 w-3 rounded-full border-2 border-theme-navy-200 hover:border-transparent hover:bg-theme-navy-700 dark:border-theme-secondary-600 dark:hover:border-transparent dark:hover:bg-theme-secondary-600" />
		),
		dots: true,
		dotsClass: "welcome-slider-dots absolute top-4 left-4 sm:top-6 sm:left-6",
		infinite: true,
		slidesToScroll: 1,
		slidesToShow: 1,
		speed: 500,
	};

	return (
		<Slider {...settings}>
			<Slide
				title="Easy Access to Your Digital Assets"
				subtitle="Access and manage your ARK assets with ease. Importing and viewing your addresses has never been simpler."
				imageName="WelcomeSlide1"
				imageNameSm="WelcomeSlide1Sm"
			/>
			<Slide
				title="Integrated Exchanges"
				subtitle="Effortlessly swap your assets to and from ARK right within the wallet, with native support for Changelly and ChangeNow services."
				imageName="WelcomeSlide2"
				imageNameSm="WelcomeSlide2Sm"
			/>
			<Slide
				title="Fully Customizable"
				subtitle="Tailor your experience by setting your local currency, adjusting timezones, and easily customizing themes and colors to your liking."
				imageName="WelcomeSlide3"
				imageNameSm="WelcomeSlide3Sm"
			/>
		</Slider>
	);
};
