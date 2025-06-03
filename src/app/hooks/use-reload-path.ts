import { useNavigate, useLocation } from "react-router-dom";

export const useReloadPath = () => {
	const history = useNavigate();
	const location = useLocation();

	return (path?: string) => {
		history.replace(path || location.pathname);
	};
};
