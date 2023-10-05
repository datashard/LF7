export default async function sendNotif(body: any) {
    fetch(`https://${Deno.env.get('NTFY_SERVER')}/${Deno.env.get('NTFY_TOPIC')}`, {
        method: 'POST',
        body: body
    })
}