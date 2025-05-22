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
		<div className="flex flex-row justify-center items-center py-2.5 px-8 space-x-2 md:flex-col md:justify-start md:items-start md:p-0 md:m-0 md:space-x-0 md:text-right md:bg-transparent dark:bg-black bg-theme-secondary-100 md:dark:bg-transparent">
			<div className="whitespace-nowrap md:text-xs md:font-semibold text-theme-secondary-700 md:text-theme-secondary-500 dark:text-theme-secondary-500">
				{t("COMMON.YOUR_BALANCE")}
			</div>
			<div
				ref={reference}
				className="font-semibold text-theme-secondary-900 md:text-theme-secondary-text md:dark:text-theme-text dark:text-theme-secondary-200"
				data-testid="Balance__value"
			>
				<Amount value={convertedBalance} ticker={ticker} />
			</div>
		</div>
	);
};
