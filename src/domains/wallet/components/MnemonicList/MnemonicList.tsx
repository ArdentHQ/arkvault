import React, { useMemo } from "react";

import { Skeleton } from "@/app/components/Skeleton";

interface MnemonicListProperties {
	mnemonic: string;
}

export const MnemonicList: React.VFC<MnemonicListProperties> = ({ mnemonic }) => {
	let mnemonicWords: string[];

	// Check for Japanese "space"
	mnemonicWords = /\u3000/.test(mnemonic) ? mnemonic.split("\u3000") : mnemonic.split(" ");

	return (
		<ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
			{mnemonicWords.map((word, index) => (
				<li
					data-testid="MnemonicList__item"
					key={index}
					className="relative flex items-center rounded border border-theme-secondary-400 p-2 dark:border-theme-secondary-700 sm:p-4"
				>
					<span className="absolute left-0 top-0 hidden -translate-y-2 translate-x-2 bg-theme-background px-1 text-xs text-theme-secondary-700 sm:block">
						{index + 1}
					</span>
					<div className="ml-1 mr-4 block text-xs text-theme-secondary-700 sm:hidden">{index + 1}</div>
					<div className="sm:text-md text-sm">{word}</div>
				</li>
			))}
		</ul>
	);
};

export const MnemonicListSkeleton: React.VFC = () => {
	const skeletons = useMemo(
		() =>
			Array.from({ length: 24 }).map(() => {
				const [min, max] = [50, 70];

				return Math.floor(Math.random() * (max - min + 1) + min);
			}),
		[],
	);

	return (
		<ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
			{skeletons.map((width, index) => (
				<li
					data-testid="MnemonicList__item_skeleton"
					key={index}
					className="relative flex items-center rounded border border-theme-secondary-300 p-2 dark:border-theme-secondary-700 sm:p-4"
				>
					<span className="absolute left-0 top-0 hidden -translate-y-2 translate-x-2 bg-theme-background px-1 text-xs text-theme-secondary-700 sm:block">
						{index + 1}
					</span>
					<div className="ml-1 mr-4 block text-xs text-theme-secondary-700 sm:hidden">{index + 1}</div>
					<div>
						<Skeleton width={width} height={20} />
					</div>
				</li>
			))}
		</ul>
	);
};
