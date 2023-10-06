export default async function sendNotif(body: any) {
    try {
        const res = await fetch(`${(`https://${Deno.env.get('NTFY_SERVER')}/${Deno.env.get('NTFY_TOPIC')}?auth=${Deno.env.get('NTFY_TOKEN')}`)}`, {
            method: 'POST',
            body: 'this is a test',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return res
    } catch (error) {
        console.error(error)
        return error
    }
}