import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

import query from "./lib/mysql.ts";
import queries from './lib/queries.ts'
import getBody from "./lib/getBody.ts";
import returnError from "./lib/errors.ts";
import sendNotif from "./lib/sendNotif.ts";

const router = new Router();

router.get('/', async (ctx) => {
    // TODO Replace
    ctx.response.body = (await query('select * from devices;')).rows
})

router.post('/register', async (ctx) => {
    try {
        const body = await getBody(ctx)
        if (!body.id) {
            return returnError(ctx, 'NoID')
        }

        let check = (await query(queries.SELECT.DEVICES(body.id))).rows

        if (check?.length === 0) {
            try {
                await query(queries.INSERT.DEVICES(body.name, body.id))
                await query(queries.INSERT.SETTINGS(body.id))
                return ctx.response.body = {
                    message: "Device was registered successfully."
                }
            } catch (error) {
                return ctx.response.body = error
            }
        } else {
            // @ts-ignore: No Typings
            return ctx.response.body = check[0]
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

    let check = (await query(queries.SELECT.DEVICES(deviceID))).rows

    if (check?.length === 0) {
        return returnError(ctx, 'NoID')
    }

    let settings = (await query(queries.SELECT.SETTINGS(deviceID))).rows

    if (settings?.length === 0) {
        let insert = await query(queries.INSERT.SETTINGS(deviceID))
        return ctx.response.body = insert
    } else {
        let update = await query(queries.UPDATE.ALL_SETTINGS(deviceID, body.settings))
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
    try {
        const body = await getBody(ctx)

        if (!body.id) return returnError(ctx, 'NoID')
        if (!body.waterlevel) return returnError(ctx, 'NoValuePassed')

        // @ts-ignore: No Typings
        const settings = JSON.parse((await query(queries.SELECT.SETTINGS(body.id))).rows[0].jsonData)
        const insert = await query(queries.INSERT.LEVEL(body.id, body.waterlevel))

        if (body.waterlevel > settings.alertLevel) {
            try {
                // const notif = await sendNotif({
                //     message: `Waterlevel (${body.waterlevel}) is above configured alert level (${settings.alertLevel})`,
                //     // priority: 4,
                //     title: `Waterlevel Alert on ${body.id}`,
                //     // tags: ['waterlevel', 'alert']
                // })

                const notif = await sendNotif('this is a test')

                console.log(notif)
            } catch (error) {
                console.error(error)
            }
        }


        return ctx.response.body = insert
    } catch (error) {
        console.error(error)
        ctx.response.status = 500
    }


})

const app = new Application();
app.use(oakCors({ origin: "*" }));
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 3000 });