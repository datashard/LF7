import { Context } from "https://deno.land/x/oak@v11.1.0/context.ts";

export default async function getBody(ctx: Context) {
    return await ctx.request.body().value
}