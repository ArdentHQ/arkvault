import { Networks } from "@payvo/sdk";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Linkify from "react-linkify";

import { NewsCardProperties } from "./NewsCard.contracts";
import { Divider } from "@/app/components/Divider";
import { Label } from "@/app/components/Label";
import { Link } from "@/app/components/Link";
import { TimeAgo } from "@/app/components/TimeAgo";
import { useEnvironmentContext } from "@/app/contexts";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { AvailableNewsCategories } from "@/domains/news/news.contracts";
import { assertNetwork } from "@/utils/assertions";

export const NewsCard: React.VFC<NewsCardProperties> = ({
	text,
	category,
	author,
	created_at: createdAt,
	coverImage,
}) => {
	const { env } = useEnvironmentContext();
	const { t } = useTranslation();

	const network = useMemo(
		() =>
			env
				.availableNetworks()
				.find((network: Networks.Network) => network.isLive() && author.coin === network.coin()),
		[author, env],
	);

	assertNetwork(network);

	return (
		<div data-testid="NewsCard">
			<div className="relative h-full w-full cursor-default border-b border-theme-primary-100 bg-theme-background p-3 text-left transition-colors-shadow duration-200 dark:border-theme-secondary-800 md:rounded-lg md:border-2 md:border-b-2 md:p-5">
				<div className="flex flex-col space-y-6 bg-theme-background p-5">
					<div className="flex w-full justify-between">
						<div className="flex items-center">
							<div className="flex items-center md:hidden">
								<NetworkIcon isCompact network={network} size="lg" noShadow />
							</div>

							<div className="hidden md:block">
								<NetworkIcon network={network} size="lg" noShadow />
							</div>

							<div className="ml-4 flex items-center space-x-2 md:flex-col md:items-start md:space-x-0">
								<h4 className="text-lg font-semibold" data-testid={`NewsCard__asset-${network.coin()}`}>
									{network.coin()}
								</h4>

								<div className="flex md:hidden">
									<Divider type="vertical" />
								</div>

								<div className="flex items-center space-x-2">
									<p
										className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700"
										data-testid="NewsCard__date-created"
									>
										<TimeAgo date={createdAt} />
									</p>
								</div>
							</div>
						</div>

						<div className="flex flex-col justify-end">
							<Label color="warning" variant="solid">
								<span className="mx-1 text-sm" data-testid="NewsCard__category">
									#{t(`NEWS.CATEGORIES.${(category as AvailableNewsCategories).toUpperCase()}`)}
								</span>
							</Label>
						</div>
					</div>

					<Divider size="sm" />

					<div className="whitespace-pre-line text-theme-secondary-text" data-testid="NewsCard__content">
						<Linkify
							componentDecorator={(pathname: string, text: string, key: number) => (
								<Link to={pathname} key={key} isExternal>
									{text}
								</Link>
							)}
						>
							{text}
						</Linkify>
					</div>

					{coverImage && (
						<div className="-mx-10 flex justify-center border-t-2 border-theme-primary-100 p-1 dark:border-theme-secondary-800">
							<img src={coverImage} alt="Payvo Banner" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
