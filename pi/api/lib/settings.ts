import { Context } from "https://deno.land/x/oak@v11.1.0/context.ts";
import returnError from "./errors.ts";
import query from "./mysql.ts";

export async function getSettings(ctx: Context) {

    const params = await ctx.request.url.searchParams
    const deviceID = params.get('id')

    if (!deviceID) {
        return returnError(ctx, 'NoID')
    }

    // @ts-ignore: Has no Typings
    const settings = (await query(`select * from settings where device='${deviceID}';`)).rows[0].jsonData

    if (settings?.length === 0) {
        return returnError(ctx, 'NoIDSettings')
    }
    return settings

}

export async function setDefaultSettings(id: string, body: any) {
    let insert = await query(`insert into settings(device, jsonData) values ('${id}', '${JSON.stringify({ interval: 60 * 1000, alertLevel: 300 })}');`)
    return insert

}

export async function updateSetting(ctx: Context, id: string, setting: string, value: any) {
    if (!id) return returnError(ctx, 'NoID')
    if (!setting) return returnError(ctx, 'NoSettingPassed')
    if (!value) return returnError(ctx, 'NoValuePassed')

    let update = await query(`UPDATE settings SET jsonData = JSON_SET(jsonData, '$.${setting}', '${value}') WHERE device = '${id}';`)


    return update
}