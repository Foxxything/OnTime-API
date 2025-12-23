import { pool } from "./db";

const FETCH_NEXT_ACTORS_WO_CURRENT = `
    SELECT DISTINCT a.actor_name
    FROM ontime.events e_next
    JOIN ontime.actors_in_events aie_next
        ON aie_next.event_id = e_next.event_id
    JOIN ontime.actors a
        ON a.actor_id = aie_next.actor_id
    WHERE e_next.event_cue = (
        SELECT MIN(e2.event_cue)
        FROM ontime.events e2
        WHERE e2.event_cue > (
            SELECT e1.event_cue
            FROM ontime.events e1
            WHERE e1.event_id = ?
        )
    )
    AND NOT EXISTS (
        SELECT 1
        FROM ontime.actors_in_events aie_curr
        WHERE aie_curr.event_id = ?
        AND aie_curr.actor_id = a.actor_id
    );
`;

const FETCH_NEXT_ACTORS = `
    SELECT DISTINCT a.actor_name
    FROM ontime.events e_next
    JOIN ontime.actors_in_events aie_next
        ON aie_next.event_id = e_next.event_id
    JOIN ontime.actors a
        ON a.actor_id = aie_next.actor_id
    WHERE e_next.event_cue = (
        SELECT MIN(e2.event_cue)
        FROM ontime.events e2
        WHERE e2.event_cue > (
            SELECT e1.event_cue
            FROM ontime.events e1
            WHERE e1.event_id = ?
        )
    );
`;

const FETCH_TIME = `SELECT NOW() AS currentTime;`;

export class DbClient {
    private pool = pool;

    async fetchNextActorsWithoutCurrent(eventId: string): Promise<string[]> {
        const conn = await this.pool.getConnection();
        try {
            const rows = await conn.query(FETCH_NEXT_ACTORS_WO_CURRENT, [eventId, eventId]);
            return rows.map((row: any) => row.actor_name);
        } finally {
            conn.release();
        }
    }

    async fetchNextActors(eventId: string): Promise<string[]> {
        const conn = await this.pool.getConnection();
        try {
            const rows = await conn.query(FETCH_NEXT_ACTORS, [eventId]);
            return rows.map((row: any) => row.actor_name);
        } finally {
            conn.release();
        }
    }

    async fetchCurrentDbTime(): Promise<Date> {
        const conn = await this.pool.getConnection();
        try {
            const rows = await conn.query(FETCH_TIME);
            return new Date(rows[0].currentTime);
        } finally {
            conn.release();
        }
    }
}