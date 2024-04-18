import React, { useEffect, useState } from "react";

import { MnemonicVerificationInput } from "./MnemonicVerificationInput";
import { randomWordPositions } from "./utils/randomWordPositions";

interface Properties {
	mnemonic: string;
	handleComplete: (isComplete: boolean) => void;
}

export function MnemonicVerification({ mnemonic, handleComplete }: Properties) {
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
		<div className="mt-8 grid gap-3 sm:grid-cols-3">
			{positions.map((position) => (
				<MnemonicVerificationInput
					key={position}
					position={position}
					answer={mnemonicWords[position - 1]}
					handleChange={handleChange}
					isValid={validatedPositions[position]}
				/>
			))}
		</div>
	);
}
