import express, { Request, Response } from "express";
import "dotenv/config";
import { env } from "./env";

import { OntimeWrapper } from "./OnTime/OntimeWrapper";
import { sha256 } from "./sha256";

import { DbClient } from "./DB/DbClient";
import { ApiClient } from "./OnTime/ApiClient";

const app = express();
const dbClient = new DbClient();

const ontimeWrapper = new OntimeWrapper(new ApiClient(`http://${env.ONTIME_HOST}:${env.ONTIME_PORT}`));

const PORT = env.API_PORT;

app.get("/health", async (req: Request, res: Response) => {
    const results = await Promise.all([
        dbClient.fetchCurrentDbTime()
            .then(() => ({ db: "ok" }))
            .catch((err) => ({ db: "error", message: err.message })),
        ontimeWrapper.getVersion()
            .then((version) => ({ ontime: "ok", version }))
            .catch((err) => ({ ontime: "error", message: err.message })),
    ]);

    const healthStatus = results.reduce((acc, curr) => ({ ...acc, ...curr }), {} as Record<string, any>);

    // Check overall health by ensuring no status is "error"
    const isHealthy = !Object.values(healthStatus).some((status) =>
        typeof status === "string" ? status === "error" : status?.status === "error"
    );

    if (isHealthy) {
        res.status(200).json({ status: "ok", details: healthStatus });
    } else {
        res.status(500).json({ status: "error", details: healthStatus });
    }
});

app.get("/next-actors-no-current", async (request: Request, response: Response) => {
    let eventIDQuery: any = request.query.eventID;
    if (!eventIDQuery || Array.isArray(eventIDQuery)) {
        eventIDQuery = await ontimeWrapper.getCurrentEventID();
    }

    const providedKey = request.query.key;
    const visible = request.query.visible === 'true';

    const expectedKey = sha256(env.DB_PASSWORD);

    if (providedKey !== expectedKey) {
        return response.status(403).json({ error: "Invalid API key" });
    }

    const eventID = String(eventIDQuery); // safely cast to string

    try {
        const actors = await dbClient.fetchNextActorsWithoutCurrent(eventID);
        console.log("Fetched actors:", actors);
        if (actors.length == 0) {
            return response.status(404).json({ error: "No upcoming actors found" });
        }

        ontimeWrapper.setSecondaryText(`Get ready: ${actors.join(", ")}`).catch((err) => {
            response.status(500).json({ error: `Failed to set secondary text: ${err.message}` });
        });
        ontimeWrapper.setSecondaryVisibility(visible).catch((err) => {
            response.status(500).json({ error: `Failed to set secondary visibility: ${err.message}` });
        });
        response.status(200).json({ actors });

    } catch (error: any) {
        response.status(500).json({ error: error.message });
    }
});

app.get("/next-actors", async (request: Request, response: Response) => {
    let eventIDQuery: any = request.query.eventID;
    if (!eventIDQuery || Array.isArray(eventIDQuery)) {
        eventIDQuery = await ontimeWrapper.getCurrentEventID();
    }
    
    const providedKey = request.query.key;
    const visible = request.query.visible === 'true';

    const expectedKey = sha256(env.DB_PASSWORD);

    if (providedKey !== expectedKey) {
        return response.status(403).json({ error: "Invalid API key" });
    }

    if (!eventIDQuery || Array.isArray(eventIDQuery)) {
        return response.status(400).json({ error: "Missing or invalid eventID parameter" });
    }

    const eventID = String(eventIDQuery); // safely cast to string

    try {
        const actors = await dbClient.fetchNextActors(eventID);
        console.log("Fetched actors:", actors);
        if (actors.length == 0) {
            return response.status(404).json({ error: "No upcoming actors found for the given eventID" });
        }

        ontimeWrapper.setSecondaryText(`Get ready: ${actors.join(", ")}`).catch((err) => {
            response.status(500).json({ error: `Failed to set secondary text: ${err.message}` });
        });
        ontimeWrapper.setSecondaryVisibility(visible).catch((err) => {
            response.status(500).json({ error: `Failed to set secondary visibility: ${err.message}` });
        });
        response.status(200).json({ actors });
    } catch (error: any) {
        response.status(500).json({ error: error.message });
    }
});


app.get("/timer-state", async (request: Request, response: Response) => {
    try {
        const timerState = await ontimeWrapper.getTimerState();
        response.status(200).json(timerState);
    } catch (error: any) {
        response.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
});