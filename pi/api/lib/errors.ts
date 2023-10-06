import { Context } from "https://deno.land/x/oak@v11.1.0/context.ts";

const Errors = {
    "NoID": {
        body: {
            code: 1,
            message: "The ID was not given or found.",
        },
        status: 400
    },
    "NoIDSettings": {
        body: {
            code: 2,
            message: "Settings for this ID could not be found.",
        },
        status: 404
    },
    "NoSettingPassed": {
        body: {
            code: 3,
            message: "No Setting was passed to the Function."
        }, status: 400
    },
    "NoValuePassed": {
        body: {
            code: 4,
            message: "No Value was passed to the Function."
        }, status: 400
    },
    // "NoID": {},
    // "NoID": {},
}




export default function returnError(ctx: Context, error: keyof typeof Errors) {
    console.log(error)
    ctx.response.status = Errors[error].status
    return ctx.response.body = Errors[error].body
}