import { useLocation, useNavigate } from "react-router-dom";

export const useReloadPath = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (path?: string) => {
		navigate(path || location.pathname, { replace: true });
	};
};
