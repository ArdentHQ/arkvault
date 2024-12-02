import React, { useLayoutEffect, useState } from "react";
import { getTrackBackground, Range as ReactRange } from "react-range";
import { twMerge } from "tailwind-merge";

interface Properties {
	values: number[];
	onChange: (values: number[]) => void;
	min: number;
	max: number;
	step: number;
	isInvalid?: boolean;
}

export const Range = ({ values, min = 1, max = 100, step = 1, onChange, isInvalid }: Properties) => {
	const color = isInvalid ? "var(--theme-color-danger-700)" : "var(--theme-color-primary-600)";

	/*
	 * Ensure at least one value on mount to properly render the thumb
	 * as the `react-range` package does not watch changes in `values` to recalculate offsets
	 */
	const [rangeValues, setRangeValues] = useState([min]);

	useLayoutEffect(() => {
		setRangeValues(values);
	}, [values]);

	return (
		<div data-testid="Range" className="flex flex-wrap justify-center">
			<ReactRange
				values={rangeValues}
				step={step}
				min={min}
				max={max}
				onChange={onChange}
				renderTrack={({ props: track, children }) => (
					<div
						data-testid="Range__track"
						onMouseDown={track.onMouseDown}
						onTouchStart={track.onTouchStart}
						className="flex h-px w-full rounded"
						style={track.style}
					>
						<div
							data-testid="Range__track__filled"
							className="h-1 w-full self-center rounded border-0 p-0"
							style={{
								background: getTrackBackground({
									colors: [color, "transparent"],
									max,
									min,
									values,
								}),
							}}
							ref={track.ref}
						>
							{children}
						</div>
					</div>
				)}
				renderThumb={({ props: thumb }) => (
					<div
						data-testid="Range__thumb"
						{...thumb}
						className={twMerge(
							"m-0 h-4 w-4 rounded-full border-3 border-theme-primary-600 bg-theme-background transition-colors duration-100 focus:shadow-outline focus:outline-none active:bg-theme-primary-600",
						)}
						style={{ ...thumb.style, borderColor: color }}
					/>
				)}
			/>
		</div>
	);
};
