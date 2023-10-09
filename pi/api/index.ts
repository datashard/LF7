import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { oakAdapter, ViewConfig, handlebarsEngine } from "https://deno.land/x/view_engine@v10.6.0/mod.ts"

import query from "./lib/mysql.ts";
import queries from './lib/queries.ts'
import getBody from "./lib/getBody.ts";
import returnError from "./lib/errors.ts";
import sendNotif from "./lib/sendNotif.ts";
import { viewEngine } from "https://deno.land/x/view_engine@v10.6.0/lib/viewEngine.ts";

const router = new Router();

const viewConfig: ViewConfig = {
    viewRoot: "./views",
}

router.get('/', async (ctx) => {
    const device = (await query(queries.SELECT.DEVICES_SETTINGS())).rows
    // @ts-ignore: Missing Typings
    ctx.render('home.hbs', { title: 'Home', device })
})

router.get('/fetch', async (ctx) => {
    const last50 = (await query(queries.SELECT.LAST50())).rows?.reverse()
    const alertLevels = (await query(queries.SELECT.ALERTLEVELS())).rows

    const reply = {
        recent: last50,
        alertLevels
    }


    return ctx.response.body = reply
})

router.post('/register', async (ctx) => {
    try {
        const body = await getBody(ctx)
        if (!body.id) {
            return returnError(ctx, 'NoID')
        }

        let check = (await query(queries.SELECT.DEVICE(body.id))).rows

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

router.post('/update', async (ctx) => {

    const body = await getBody(ctx)
    const deviceID = body.id
    const setting = body.setting
    const value = body.value

    if (!deviceID) {
        return returnError(ctx, 'NoID')
    }

    if (setting === "deviceName") {
        let update = await query(queries.UPDATE.UPDATE_DEVICENAME(deviceID, value))
        return ctx.response.body = update
    }

    // update setting
    let update = await query(queries.UPDATE.SETTING(deviceID, setting, value))

    return ctx.response.body = update

})

router.post('/settings', async (ctx) => {
    const params = await ctx.request.url.searchParams
    const deviceID = params.get('id')
    const body = await getBody(ctx)

    if (!deviceID) {
        return returnError(ctx, 'NoID')
    }

    let check = (await query(queries.SELECT.DEVICE(deviceID))).rows

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
        // @ts-ignore: No Typings
        const device = (await query(queries.SELECT.DEVICENAME(body.id))).rows[0].deviceName
        const insert = await query(queries.INSERT.LEVEL(body.id, body.waterlevel))

        if (body.waterlevel >= settings.alertLevel) {
            try {
                sendNotif({
                    title: device,
                    message: `Waterlevel (${body.waterlevel}) is equal to/above configured alert level (${settings.alertLevel})`,
                    tags: ['waterlevel', 'alert']
                })


            } catch (error) {
                console.error(error)
            }
        }


        return ctx.response.body = {
            message: "Waterlevel was inserted successfully.",
            settings
        }
    } catch (error) {
        console.error(error)
        ctx.response.status = 500
    }


})

const app = new Application();
app.use(viewEngine(oakAdapter, handlebarsEngine, viewConfig))
app.use(oakCors({ origin: "*" }));
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 3000 });