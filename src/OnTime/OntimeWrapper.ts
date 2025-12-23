import { ApiClient } from "./ApiClient";
import { messageResponse, PlaybackState, TimerResponse } from "../models/OnTimeModels";

export class OntimeWrapper {
    constructor(private apiClient: ApiClient) { }

    private mapTimerResponse(t: any): TimerResponse {
        return {
            addedTime: t.addedTime,
            current: t.current,
            duration: t.duration,
            elapsed: t.elapsed,
            expectedFinish: t.expectedFinish,
            playback: t.playback,
            startedAt: t.startedAt,
        };
    }

    private mapMessageResponse(raw: any): messageResponse {
        return {
            timer: {
                text: raw.timer?.text ?? "",
                visible: raw.timer?.visible ?? false,
                blink: raw.timer?.blink ?? false,
                blackout: raw.timer?.blackout ?? false,
                secondarySource: raw.timer?.secondarySource ?? null,
            },
            secondary: raw.secondary ?? "",
        };
    }


    async setSecondaryText(text: string): Promise<boolean | Error> {
        const rawResult: any = await this.apiClient.get(`/api/message/secondary/${encodeURIComponent(text)}`);
        const result: messageResponse = this.mapMessageResponse(rawResult);

        if (result.secondary !== text) {
            return new Error(`Failed to set secondary text to "${text}", got "${result.secondary}" instead.`);
        }

        return true;
    }


    async setSecondaryVisibility(visible: boolean): Promise<boolean | Error> {
        const source = visible ? 'secondary' : 'off';
        const rawResult: any = await this.apiClient.get(
            `/api/message/timer?secondarySource=${source}`
        );

        const result: messageResponse = this.mapMessageResponse(rawResult);

        if (visible && result.timer.secondarySource !== 'secondary') {
            return new Error(
                `Failed to set secondary visibility to "visible", got "${result.timer.secondarySource}" instead.`
            );
        } else if (!visible && result.timer.secondarySource !== null) {
            return new Error(
                `Failed to set secondary visibility to "hidden", got "${result.timer.secondarySource}" instead.`
            );
        }

        return true;
    }

    async getTimerState(): Promise<TimerResponse> {
        const result: any = await this.apiClient.get(`/api/poll`);
        return this.mapTimerResponse(result.payload.timer);
    }

    async getVersion(): Promise<string> {
        const result: any = await this.apiClient.get(`/api/version`);
        return result.version;
    }

}