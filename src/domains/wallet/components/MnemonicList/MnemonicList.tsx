import React from "react";
import { Skeleton } from "@/app/components/Skeleton";

interface Properties {
	mnemonic: string;
}

const skeletons = [...Array.from({ length: 24 }).keys()].map((index) => {
	const min = 50;
	const max = 70;
	return [index + 1, Math.floor(Math.random() * (max - min + 1) + min)];
});

export function MnemonicList({ mnemonic }: Properties) {
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
					<span className="absolute top-0 left-0 hidden translate-x-2 -translate-y-2 bg-theme-background px-1 text-xs text-theme-secondary-700 sm:block">
						{index + 1}
					</span>
					<div className="ml-1 mr-4 block text-xs text-theme-secondary-700 sm:hidden">{index + 1}</div>
					<div className="sm:text-md text-sm">{word}</div>
				</li>
			))}
		</ul>
	);
}

export function MnemonicListSkeleton() {
	return (
		<ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
			{skeletons.map(([index, width]) => (
				<li
					data-testid="MnemonicList__item_skeleton"
					key={index}
					className="relative flex items-center rounded border border-theme-secondary-300 p-2 dark:border-theme-secondary-700 sm:p-4"
				>
					<span className="absolute top-0 left-0 hidden translate-x-2 -translate-y-2 bg-theme-background px-1 text-xs text-theme-secondary-700 sm:block">
						{index}
					</span>
					<div className="mr-4 block text-xs sm:hidden">
						<Skeleton width={20} height={20} />
					</div>
					<div>
						<Skeleton width={width} height={20} />
					</div>
				</li>
			))}
		</ul>
	);
}
