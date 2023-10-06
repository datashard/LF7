import { Context } from "https://deno.land/x/oak@v11.1.0/context.ts";
import returnError from "./errors.ts";
import query from "./mysql.ts";
import queries from "./queries.ts";

export async function getSettings(ctx: Context) {

    const params = await ctx.request.url.searchParams
    const deviceID = params.get('id')

    if (!deviceID) {
        return returnError(ctx, 'NoID')
    }

    // @ts-ignore: Has no Typings
    const settings = (await query(queries.SELECT.SETTINGS(deviceID))).rows[0].jsonData

    if (settings?.length === 0) {
        return returnError(ctx, 'NoIDSettings')
    }
    return settings

}

export async function setDefaultSettings(id: string) {
    let insert = await query(queries.INSERT.SETTINGS(id))
    return insert

}

export async function updateSetting(ctx: Context, id: string, setting: string, value: any) {
    if (!id) return returnError(ctx, 'NoID')
    if (!setting) return returnError(ctx, 'NoSettingPassed')
    if (!value) return returnError(ctx, 'NoValuePassed')

    let update = await query(queries.UPDATE.SETTING(id, setting, value))


    return update
}