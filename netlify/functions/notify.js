exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
     
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
     
    const payload = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

    try {
        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 
                'Content-Type': contentType 
            },
            body: payload
        });
        
        if (!response.ok) {
            throw new Error(`Discord Error: ${response.status}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "ส่งความรักสำเร็จ!" })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "ระบบขัดข้อง" })
        };
    }
};
