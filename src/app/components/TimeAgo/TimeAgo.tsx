import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateTime } from "@/app/lib/intl";
import { TIME_PERIODS } from "./TimeAgo.constants";
import { DateDifferenceReturnValue } from "./TimeAgo.contracts";

const dateDifference = (date: string): DateDifferenceReturnValue => {
	const now = DateTime.make();
	const target = DateTime.make(date);

	for (const period of TIME_PERIODS) {
		const count: number = now[`diffIn${period}`](target);
		if (count > 0) {
			return { count, key: period.toUpperCase() };
		}
	}

	return { key: "FEW_SECONDS" };
};

const getNextUpdateDelay = (isoDate: string): number | null => {
	const start = new Date(isoDate).getTime();
	const now = Date.now();
	const elapsed = now - start;

	const minute = 60_000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (elapsed < minute) {
		return minute - elapsed;
	}
	if (elapsed < hour) {
		return minute - (elapsed % minute);
	}
	if (elapsed < day) {
		return hour - (elapsed % hour);
	}

	return null;
};

export const TimeAgo = ({ date }: { date: string }) => {
	const { t } = useTranslation();
	const [, forceTick] = useState(0);

	useEffect(() => {
		const schedule = () => {
			const delay = getNextUpdateDelay(date);

			if (delay === null) {
				return;
			}

			const timerId = window.setTimeout(
				() => {
					forceTick((x) => x + 1);
					schedule();
				},
				Math.max(1_000, delay),
			);

			return () => window.clearTimeout(timerId);
		};

		return schedule();
	}, [date]);

	const { count, key } = dateDifference(date);
	return <span data-testid="TimeAgo">{t(`COMMON.DATETIME.${key}_AGO`, { count })}</span>;
};
