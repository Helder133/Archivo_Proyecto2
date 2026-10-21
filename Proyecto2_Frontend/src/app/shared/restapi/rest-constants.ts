export class RestConstants {
    private readonly API_URL: string = "http://localhost:3000/api/v1/";

    public getApiUrl(): string {
        return this.API_URL;
    }
}