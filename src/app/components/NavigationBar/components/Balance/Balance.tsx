import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { BalanceSkeleton } from "./BalanceSkeleton";
import { Amount } from "@/app/components/Amount";
import { useProfileBalance } from "@/app/hooks/use-profile-balance";
import { assertProfile, assertString } from "@/utils/assertions";

interface BalanceProperties {
	profile?: Contracts.IProfile;
	isLoading?: boolean;
}

export const Balance: React.FC<BalanceProperties> = ({ profile, isLoading }: BalanceProperties) => {
	const [width, setWidth] = useState<number | undefined>();

	const reference = useRef<HTMLDivElement>(null);

	const { t } = useTranslation();
	const { convertedBalance } = useProfileBalance({ isLoading, profile });

	useEffect(() => setWidth((width) => reference.current?.clientWidth || width), [convertedBalance]);

	if (isLoading) {
		return <BalanceSkeleton width={width} />;
	}

	assertProfile(profile);

	if (!profile.status().isRestored()) {
		return <BalanceSkeleton width={width} />;
	}

	const ticker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);

	assertString(ticker);

	return (
		<div className="bg-theme-secondary-100 flex flex-row items-center justify-center space-x-2 px-8 py-2.5 md:m-0 md:flex-col md:items-start md:justify-start md:space-x-0 md:bg-transparent md:p-0 md:text-right dark:bg-black md:dark:bg-transparent">
			<div className="text-theme-secondary-700 dark:text-theme-secondary-500 md:text-theme-secondary-500 whitespace-nowrap md:text-xs md:font-semibold">
				{t("COMMON.YOUR_BALANCE")}
			</div>
			<div
				ref={reference}
				className="text-theme-secondary-900 dark:text-theme-secondary-200 md:text-theme-secondary-text md:dark:text-theme-text font-semibold"
				data-testid="Balance__value"
			>
				<Amount value={convertedBalance} ticker={ticker} />
			</div>
		</div>
	);
};
