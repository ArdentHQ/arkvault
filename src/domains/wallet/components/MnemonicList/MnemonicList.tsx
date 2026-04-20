import React, { useMemo } from "react";
import { Skeleton } from "@/app/components/Skeleton";

interface MnemonicListProperties {
	mnemonic: string;
}

// Check for Japanese "space"
const mnemonicWords = (mnemonic: string): string[] => {
	if (!mnemonic) {
		return [];
	}

	return /\u3000/.test(mnemonic) ? mnemonic.split("\u3000") : mnemonic.split(" ");
};

export const MnemonicList = ({ mnemonic }: MnemonicListProperties) => (
	<ul className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-3 sm:gap-y-4">
		{mnemonicWords(mnemonic).map((word, index) => (
			<li
				data-testid="MnemonicList__item"
				key={index}
				className="border-theme-secondary-400 dark:border-theme-dark-500 dim:border-theme-dim-500 relative flex items-center rounded border p-[3px]"
			>
				<div className="bg-theme-secondary-200 text-theme-secondary-700 dark:bg-theme-dark-800 dark:text-theme-dark-200 dim:text-theme-dim-200 dim:bg-theme-dim-800 mr-2 w-8 rounded p-2 text-center text-sm leading-[17px] font-semibold">
					{index + 1}
				</div>
				<div className="sm:text-md dim:text-theme-dim-50 text-sm">{word}</div>
			</li>
		))}
	</ul>
);

export const MnemonicListSkeleton = () => {
	const skeletons = useMemo(
		() =>
			Array.from({ length: 24 }).map(() => {
				const [min, max] = [40, 60];

				return Math.floor(Math.random() * (max - min + 1) + min);
			}),
		[],
	);

	return (
		<ul className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-3 sm:gap-y-4">
			{skeletons.map((width, index) => (
				<li
					data-testid="MnemonicList__item_skeleton"
					key={index}
					className="border-theme-secondary-400 dark:border-theme-dark-00 relative flex items-center rounded border p-[3px]"
				>
					<div className="bg-theme-secondary-200 text-theme-secondary-700 dark:bg-theme-dark-800 dark:text-theme-dark-200 mr-2 w-8 rounded p-2 text-center text-sm leading-[17px] font-semibold">
						{index + 1}
					</div>
					<div>
						<Skeleton width={width} height={20} />
					</div>
				</li>
			))}
		</ul>
	);
};
