export interface ProberService {
	evaluate(host: string): Promise<boolean>;
}
