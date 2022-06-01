import { sample } from "@payvo/sdk-helpers";
import React, { useEffect, useMemo, useState } from "react";

import { MnemonicVerificationOptions } from "./MnemonicVerificationOptions";
import { MnemonicVerificationProgress } from "./MnemonicVerificationProgress";
import { TabPanel, Tabs } from "@/app/components/Tabs";

interface Properties {
	mnemonic: string;
	wordPositions?: number[];
	optionsLimit: number;
	handleComplete: () => void;
	isCompleted?: boolean;
}

const randomWordPositions = (length: number): number[] => {
	const positions: number[] = [...Array.from({ length }).keys()];
	const result: number[] = [];

	while (result.length < 3) {
		const randomNumber = sample(positions) + 1;

		if (result.includes(randomNumber)) {
			continue;
		}

		result.push(randomNumber);
	}

	return result;
};

const defaultProps = {
	wordPositions: [],
};

export function MnemonicVerification({
	mnemonic,
	wordPositions = defaultProps.wordPositions,
	optionsLimit,
	handleComplete,
	isCompleted = false,
}: Properties) {
	const [activeTab, setActiveTab] = useState(0);
	const [positions, setPositions] = useState([] as number[]);

	let mnemonicWords: string[];

	// Check for Japanese "space"
	mnemonicWords = /\u3000/.test(mnemonic) ? mnemonic.split("\u3000") : mnemonic.split(" ");

	if (!wordPositions?.length && activeTab === 0 && positions.length === 0) {
		setPositions(randomWordPositions(mnemonicWords.length));
	} else if (activeTab === 0 && positions.length === 0) {
		setPositions(wordPositions);
	}

	useEffect(() => {
		if (isCompleted) {
			setActiveTab(positions.length);
		}
	}, [isCompleted, positions, setActiveTab]);

	const currentAnswer = useMemo(() => mnemonicWords[positions[activeTab] - 1], [activeTab, positions, mnemonicWords]);

	const handleChange = (value: string) => {
		if (value === currentAnswer) {
			if (activeTab === positions.length - 1) {
				handleComplete();
			}

			setActiveTab(activeTab + 1);
		}
	};

	return (
		<Tabs activeId={activeTab}>
			<MnemonicVerificationProgress activeTab={activeTab} wordPositions={positions} />

			{!isCompleted && (
				<div className="mt-8">
					{positions.map((position, index) => (
						<TabPanel key={index} tabId={index}>
							<MnemonicVerificationOptions
								limit={optionsLimit}
								answer={currentAnswer}
								options={mnemonicWords}
								handleChange={handleChange}
								position={position}
							/>
						</TabPanel>
					))}
				</div>
			)}
		</Tabs>
	);
}
