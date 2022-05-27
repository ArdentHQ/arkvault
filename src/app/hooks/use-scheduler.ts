import { useEffect, useRef } from "react";

type UseSchedulerHook = (config: { handler: () => void; timeout: number; autostart: boolean }) => {
	start: () => void;
	stop: () => void;
};

export const useScheduler: UseSchedulerHook = ({ handler, timeout, autostart }) => {
	const interval = useRef<number>();

	const start = () => {
		if (interval.current) {
			throw new Error("Job already started. This looks like a bug.");
		}

		handler(); // run handler for the first time before scheduling

		interval.current = window.setInterval(handler, timeout);
	};

	const stop = () => {
		window.clearInterval(interval.current);
		interval.current = undefined;
	};

	useEffect(() => {
		if (autostart) {
			start();
		}

		return () => stop();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return { start, stop };
};
