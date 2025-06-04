import React from "react";
import { Image } from "@/app/components/Image";
import Slider, { Settings } from "react-slick";

interface SlideProperties {
	title: string;
	subtitle: string;
	imageName: string;
	imageNameSm: string;
}

const Slide = ({ title, subtitle, imageName, imageNameSm }: SlideProperties) => (
	<div className="flex flex-row w-full md:w-auto lg:flex-col">
		<div className="w-full p-4 sm:shrink-0 sm:p-6 md:w-[360px] md:pr-0 md:pb-0 lg:w-[450px]">
			<h3 className="xs:leading-5 dim:text-theme-dim-50 mt-7 mb-2 text-base leading-7 md:font-bold lg:text-2xl lg:leading-[29px]">
				{title}
			</h3>
			<p className="mb-0 text-sm text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 md:mb-4 lg:text-base lg:leading-7">
				{subtitle}
			</p>
		</div>
		<div className="justify-end flex-1 hidden overflow-hidden rounded-ee-xl md:flex">
			<div className="hidden aspect-[1.097] h-full w-full lg:block">
				<Image name={imageName} alt={title} domain="profile" />
			</div>
			<Image
				name={imageNameSm}
				alt={title}
				domain="profile"
				className="mt-3 hidden! h-[180px] md:block! lg:hidden!"
			/>
		</div>
	</div>
);

export const WelcomeSlider = (): JSX.Element => {
	const settings: Settings = {
		appendDots: (dots) => (
			<div>
				<ul className="flex gap-3 leading-3"> {dots} </ul>
			</div>
		),
		arrows: false,
		autoplay: true,
		autoplaySpeed: 5000,
		customPaging: () => (
			<button className="w-3 h-3 border-2 rounded-full border-theme-navy-200 dark:border-theme-secondary-600 dark:hover:bg-theme-secondary-600 hover:bg-theme-navy-700 hover:border-transparent dark:hover:border-transparent" />
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
