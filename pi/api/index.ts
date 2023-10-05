import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import query from "./lib/mysql.ts";
import getBody from "./lib/getBody.ts";
import returnError from "./lib/errors.ts";

const router = new Router();

router.get('/', async (ctx) => {
    ctx.response.body = (await query('select * from devices;')).rows
})

router.post('/register', async (ctx) => {
    try {
        const body = await getBody(ctx)


        if (!body.id) {
            return returnError(ctx, 'NoID')
        }
        let check = (await query(`select * from devices where id='${body.id}';`)).rows

        if (check?.length === 0) {
            let insert = await query(`insert into devices(name, id) values ('${body.name}', '${body.id}');`)
            return ctx.response.body = insert
        } else {
            return ctx.response.body = check
        }

    } catch (error) {
        console.error(error)
    }
})

router.post('/settings', async (ctx) => {
    const params = await ctx.request.url.searchParams
    const deviceID = params.get('id')
    const body = await getBody(ctx)

    if (!deviceID) {
        return returnError(ctx, 'NoID')
    }

    let check = (await query(`select * from devices where id='${deviceID}';`)).rows

    if (check?.length === 0) {
        return returnError(ctx, 'NoID')
    }

    let settings = (await query(`select * from settings where device='${deviceID}';`)).rows

    if (settings?.length === 0) {
        let insert = await query(`insert into settings(device, jsonData) values ('${deviceID}', '${JSON.stringify(body.settings)}');`)
        return ctx.response.body = insert
    } else {
        let update = await query(`update settings set jsonData='${JSON.stringify(body.settings)}' where device='${deviceID}';`)
        return ctx.response.body = update
    }
})

router.get('/settings', async (ctx) => {
    const params = await ctx.request.url.searchParams
    const deviceID = params.get('id')

    if (!deviceID) {
        return returnError(ctx, 'NoID')
    }

    let settings = (await query(`select * from settings where device='${deviceID}';`)).rows

    if (settings?.length === 0) {
        return returnError(ctx, 'NoIDSettings')

    }


    return ctx.response.body = settings

})



router.post('/sql', async (ctx) => {
    const body = await getBody(ctx)

    return ctx.response.body = await query(body.query)
})


router.post('/waterlevel', async (ctx) => {
    const body = await getBody(ctx)

    if (!body.id) {
        return returnError(ctx, 'NoID')
    }

    let check = (await query(`select * from devices where id='${body.id}';`)).rows

    if (check?.length === 0) {
        return returnError(ctx, 'NoID')
    }
    let insert = await query(`insert into waterlevel(device, level) values ('${body.id}', '${body.level}');`)


    return ctx.response.body = insert


})

const app = new Application();
app.use(oakCors({ origin: "*" }));
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 3000 });