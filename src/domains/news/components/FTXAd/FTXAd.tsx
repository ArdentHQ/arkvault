import React from "react";
import { useTranslation } from "react-i18next";

import { images } from "@/app/assets/images";
import { SvgCollection } from "@/app/assets/svg";
import { Link } from "@/app/components/Link";
import FTXBanner from "@/domains/news/images/ftx-banner.png";

const { DownloadAppStoreButton, DownloadGooglePlayButton } = images.news.common;

export const FTXAd: React.VFC = () => {
	const { t } = useTranslation();

	return (
		<div className="relative overflow-hidden border-theme-primary-100 bg-black py-6 px-8 dark:border-theme-secondary-800 md:rounded-lg md:border-2 md:py-10 md:px-10 lg:py-16">
			<div className="absolute top-0 right-4 z-20 flex rounded-b-full bg-theme-primary-100 text-center dark:bg-theme-secondary-800">
				<span className="px-2 pt-1 pb-2 text-xs font-semibold text-theme-primary-600">{t("NEWS.AD")}</span>
			</div>

			<div className="relative z-10">
				<div className="flex flex-col items-start space-y-5 text-white">
					<Link to="https://ftx.com/" showExternalIcon={false} isExternal>
						<SvgCollection.FTX className="text-white" height={60} />
					</Link>
					<p className="w-full text-lg font-medium lg:w-3/5 xl:w-3/4">
						The world&apos;s most popular Bitcoin &amp; cryptocurrency portfolio tracker. 100% free.
					</p>
				</div>

				<div className="mt-12 flex space-x-2">
					<Link
						to="https://itunes.apple.com/us/app/blockfolio-bitcoin-altcoin/id1095564685?mt=8"
						showExternalIcon={false}
						isExternal
					>
						<DownloadAppStoreButton className="b-0 h-10 w-32" />
					</Link>

					<Link
						to="https://play.google.com/store/apps/details?id=com.blockfolio.blockfolio&amp;hl=en_US"
						showExternalIcon={false}
						isExternal
					>
						<DownloadGooglePlayButton className="h-10 w-32" />
					</Link>
				</div>
			</div>

			<img src={FTXBanner} className="absolute right-0 bottom-0 z-0 hidden max-w-sm lg:block" alt="FTX Banner" />
		</div>
	);
};
