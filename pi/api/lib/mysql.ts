import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
const client = await new Client().connect({
    hostname: "db",
    username: "admin",
    db: "jch",
    poolSize: 4, // connection limit
    password: "admin",
});


const query = async (sql: string) => ((await client.execute(sql)))


export default query