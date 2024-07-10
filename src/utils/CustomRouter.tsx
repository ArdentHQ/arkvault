import React, { ReactNode, useRef } from "react";
import { BrowserHistory, createHashHistory } from "history";
import { Router } from "react-router-dom";

interface Props {
	basename?: string;
	children: React.ReactNode;
	history: BrowserHistory;
}

export const CustomRouter = ({ basename, children, history }: Props) => {
	const [state, setState] = React.useState({
		action: history.action,
		location: history.location,
	});

	React.useLayoutEffect(() => history.listen(setState), [history]);

	return (
		<Router basename={basename} location={state.location} navigator={history} navigationType={state.action}>
			{children}
		</Router>
	);
};

export const CustomRouterWrapper = ({ history, children }: { history?: BrowserHistory; children: ReactNode }) => {
	const historyRef = useRef(history ?? createHashHistory());

	return <CustomRouter history={historyRef.current}> {children} </CustomRouter>;
};
