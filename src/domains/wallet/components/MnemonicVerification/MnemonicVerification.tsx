import { sample } from "@ardenthq/sdk-helpers";
import React, { useEffect, useState } from "react";

import classNames from "classnames";
import { MnemonicVerificationInput } from "./MnemonicVerificationInput";

interface Properties {
	className?: string;
	mnemonic: string;
	handleComplete: (isComplete: boolean) => void;
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

export function MnemonicVerification({ className, mnemonic, handleComplete }: Properties) {
	const [mnemonicWords, setMnemonicWords] = useState([] as string[]);
	const [positions, setPositions] = useState([] as number[]);
	const [validatedPositions, setValidatedPositions] = useState<{
		[key: number]: boolean;
	}>({});

	useEffect(() => {
		// Check for Japanese "space"
		const words = /\u3000/.test(mnemonic) ? mnemonic.split("\u3000") : mnemonic.split(" ");
		setMnemonicWords(words);

		setPositions(randomWordPositions(words.length));
	}, []);

	const handleChange = (position: number, isValid: boolean): void => {
		setValidatedPositions((previousState) => ({ ...previousState, [position]: isValid }));
	};

	useEffect(() => {
		const results = Object.values(validatedPositions);
		const isCompleted = results.length === positions.length && results.every(Boolean);

		handleComplete(isCompleted);
	}, [validatedPositions]);

	return (
		<div className={classNames("mt-8 grid gap-3 sm:grid-cols-3", className)}>
			{positions.map((position) => (
				<MnemonicVerificationInput
					key={position}
					position={position}
					answer={mnemonicWords[position - 1]}
					handleChange={handleChange}
				/>
			))}
		</div>
	);
}
