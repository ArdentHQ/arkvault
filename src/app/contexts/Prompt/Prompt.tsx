import React, {useContext, useEffect, useRef, useState} from "react";
import {Blocker, useBlocker, useLocation} from "react-router-dom";
import {ConfirmationModal} from "@/app/components/ConfirmationModal";

interface Properties {
	children?: React.ReactNode;
}

interface Context {
	blocker: Blocker,
	setMessage: (message: string) => void,
}

export const PromptContext= React.createContext<any>(undefined);

export const PromptProvider = ({ children }: Properties) => {
	const [message, setMessage] = useState("");

	const blocker = useBlocker(message.length > 0);

	const [isOpen, setIsOpen] = useState(false);

	const confirmationFunctionReference = useRef<(allowNavigate: boolean) => void>();

	const onCancel = () => {
		confirmationFunctionReference.current?.(false);
		setIsOpen(false);
	};

	const onConfirm = () => {
		confirmationFunctionReference.current?.(true);
		setIsOpen(false);
	};

	// const getUserConfirmation = useCallback((_, callback) => {
	// 	confirmationFunctionReference.current = callback;
	// 	setIsOpen(true);
	// }, []);

	return (
		<PromptContext.Provider value={{ blocker, setMessage } as Context}>
			{children}
			<ConfirmationModal isOpen={isOpen} onCancel={onCancel} onConfirm={onConfirm} />
		</PromptContext.Provider>
	);
};

export const usePrompt = (): Context => {
	const value = useContext(PromptContext);

	if (value === undefined) {
		throw new Error("[usePrompt] Component not wrapped within a Provider");
	}

	return value;
};

export const Prompt = ({message}: {message: (location: any) => true | "block"}) => {
	const prompt = usePrompt();

	const location = useLocation();

	const message1 = message(location)

	useEffect(() => {
		if (message1 === "block") {
			prompt.setMessage(message1);
		}
	}, [message1, prompt]);

	return <></>
}
