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

	// If less than 1 minute old: wait until exactly 1 minute has passed
	// e.g., if 2 seconds old, wait 58 more seconds to show "1 minute ago"
	if (elapsed < minute) {
		return minute - elapsed;
	}
	// If less than 1 hour old: update at the next minute boundary
	if (elapsed < hour) {
		return minute - (elapsed % minute);
	}
	// If less than 1 day old: update at the next hour boundary
	if (elapsed < day) {
		return hour - (elapsed % hour);
	}
	// After 1 day: stop updating (shows "1 day ago", "2 days ago", etc.)
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
