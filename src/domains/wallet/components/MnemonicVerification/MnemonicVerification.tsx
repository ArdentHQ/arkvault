import { sample } from "@ardenthq/sdk-helpers";
import { useEffect, useState } from "react";

import { MnemonicVerificationProgress } from "./MnemonicVerificationProgress";
import { MnemonicVerificationInput } from "./MnemonicVerificationInput";
import { Tabs } from "@/app/components/Tabs";

interface Properties {
	className?: string;
	mnemonic: string;
	wordPositions?: number[];
	handleComplete: (isComplete: boolean) => void;
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

	return result.sort((a, b) => a - b);
};

const defaultProps = {
	wordPositions: [],
};

export function MnemonicVerification({
	className,
	mnemonic,
	wordPositions = defaultProps.wordPositions,
	handleComplete,
	isCompleted = false,
}: Properties) {
	const [activeTab, setActiveTab] = useState(0);
	const [positions, setPositions] = useState([] as number[]);
	const [validatedPositions, setValidatedPositions] = useState<{
		[key: number]: boolean;
	}>({});

	let mnemonicWords: string[];

	// Check for Japanese "space"
	mnemonicWords = /\u3000/.test(mnemonic) ? mnemonic.split("\u3000") : mnemonic.split(" ");

	if (!wordPositions?.length && activeTab === 0 && positions.length === 0) {
		setPositions(randomWordPositions(mnemonicWords.length));
	} else if (activeTab === 0 && positions.length === 0) {
		setPositions(wordPositions);
	}

	const handleChange = (position: number, isValid: boolean): void => {
		setValidatedPositions((previousState) => ({ ...previousState, [position]: isValid }));
	};

	useEffect(() => {
		const results = Object.values(validatedPositions);
		const isCompleted = results.length === positions.length && results.every(Boolean);

		handleComplete(isCompleted);
	}, [validatedPositions, handleComplete]);

	return (
		<Tabs className={className} activeId={activeTab}>
			<MnemonicVerificationProgress activeTab={activeTab} wordPositions={positions} />

			{!isCompleted && (
				<div className="mt-8 grid gap-3 sm:grid-cols-3">
					{positions.map((position, index) => (
						<MnemonicVerificationInput
							key={position}
							position={position}
							answer={mnemonicWords[position - 1]}
							handleChange={handleChange}
						/>
					))}
				</div>
			)}
		</Tabs>
	);
}
