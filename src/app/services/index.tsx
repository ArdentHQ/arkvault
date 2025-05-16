import { Http } from "@/app/lib/mainsail";
import { ToastService } from "./ToastService";

export const httpClient = new Http.HttpClient(10);
export const toasts = new ToastService();
