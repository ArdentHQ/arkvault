import React from "react";
import { Image } from "@/app/components/Image";
import Slider, { Settings } from "react-slick";
import { useTranslation } from "react-i18next";

const Slide = ({ title, description, image }: { title: string; description: string; image: string }) => (
	<div className="p-4 md:p-8">
		<div className="mx-auto my-2 flex max-w-56 justify-center md:max-w-full">
			<Image name={image} />
		</div>
		<div className="text-center">
			<h3 className="md:leading-7.5 mb-2 text-lg font-semibold leading-4 text-theme-secondary-900 dark:text-theme-dark-50 md:text-2xl">
				{title}
			</h3>
			<p className="mb-6 text-xs leading-5 text-theme-secondary-700 dark:text-theme-dark-200">{description}</p>
		</div>
	</div>
);

export const DashboardSetupAddressSlider = (): JSX.Element => {
	const { t } = useTranslation();

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
			<button className="h-3 w-3 rounded-full border-2 border-theme-navy-200 hover:border-transparent hover:bg-theme-navy-700 dark:border-theme-secondary-600 dark:hover:border-transparent dark:hover:bg-theme-secondary-600" />
		),
		dots: true,
		dotsClass: "welcome-slider-dots absolute top-0 left-0 mx-auto max-w-8 right-0",
		infinite: true,
		slidesToScroll: 1,
		slidesToShow: 1,
		speed: 500,
	};

	return (
		<Slider {...settings}>
			<Slide
				title={t("COMMON.IMPORT_ADDRESS")}
				description={t("DASHBOARD.WALLET_CONTROLS.IMPORT_ADDRESS_DESCRIPTION")}
				image="ImportAddress"
			/>
			<Slide
				title={t("COMMON.CREATE_ADDRESS")}
				description={t("DASHBOARD.WALLET_CONTROLS.CREATE_ADDRESS_DESCRIPTION")}
				image="CreateAddress"
			/>
		</Slider>
	);
};
