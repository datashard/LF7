import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";
const client = await new Client().connect({
    hostname: "db",
    username: "root",
    db: "jch",
    poolSize: 4, // connection limit
    password: "root",
});

// function checkIP(ip) {
//     return query(`select (ip) from devices where ip='${ip}'`)
// }

const router = new Router();
// helper
const query = async (sql: string) => ((await client.execute(sql)));

router.get('/', async (context) => {
    context.response.body = (await query('select * from devices;')).rows
})

router.post('/register', async (context) => {
    try {
        const body = await context.request.body().value


        if (!body.id) {
            context.response.status = 400
            return context.response.body = {
                message: 'The ID was not given.'
            }
        }
        let check = (await query(`select * from devices where id='${body.id}';`)).rows

        if (check?.length === 0) {
            let insert = await query(`insert into devices values ('${body.name}', '${body.id}');`)
            return context.response.body = insert
        } else {
            return context.response.body = check
        }

    } catch (error) {
        console.error(error)
    }
})


router.get('/settings', async (context) => {
    const params = await context.request.url.searchParams
    const deviceID = params.get('id')

    if (!deviceID) {
        context.response.status = 400
        return context.response.body = {
            message: 'The ID was not given.'
        }
    }

    let settings = (await query(`select * from settings where device='${deviceID}';`)).rows

    if (settings?.length === 0) {
        context.response.status = 404
        return context.response.body = {
            message: 'Settings for this ID could not be found.'
        }
    }


    return context.response.body = settings
    // return context.response.body = params

})


const app = new Application();
app.use(oakCors({ origin: "*" }));
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 3000 });