import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
const client = await new Client().connect({
    hostname: "db",
    username: "root",
    db: "jch",
    // poolSize: 1, // connection limit
    password: "",
});


const query = async (sql: string) => ((await client.execute(sql)))


export default query