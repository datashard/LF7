import { NtfyClient } from "npm:ntfy"

const ntfy = new NtfyClient(`https://${Deno.env.get('NTFY_SERVER')}`)


export default async function sendNotif({ message, tags, title }: { message: string, tags?: string[], title?: string }) {
    try {
        console.log('sending alert')
        await ntfy.publish({
            message,
            title,
            tags,
            topic: Deno.env.get('NTFY_TOPIC')!,
            authorization: {
                username: 'presentation',
                password: "testing"
            }

        })
    } catch (error) {
        console.error("experienced an error", error)
        return error
    }
}