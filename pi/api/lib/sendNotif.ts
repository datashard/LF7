import { NtfyClient } from "npm:ntfy"

const ntfy = new NtfyClient(`https://${Deno.env.get('NTFY_SERVER')}`)


export default async function sendNotif({ message, tags }: { message: string, tags: string[] }) {
    try {
        await ntfy.publish({
            message,
            topic: Deno.env.get('NTFY_TOPIC')!,
            authorization: {
                username: 'presentation',
                password: "testing"
            }

        })
    } catch (error) {
        console.error(error)
        return error
    }
}