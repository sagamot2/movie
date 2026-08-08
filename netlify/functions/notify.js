 
const { getStore } = require("@netlify/blobs");

const STORE_NAME = "site-members";
const MAX_NAME_LENGTH = 40;

function normalizePhone(raw) {
    return String(raw || "").replace(/[^0-9]/g, "");
}

function isValidPhone(phone) { 
    return /^0[0-9]{8,9}$/.test(phone);
}

exports.handler = async function (event) {
    const store = getStore(STORE_NAME);

    if (event.httpMethod === "GET") {
        const phone = normalizePhone(event.queryStringParameters && event.queryStringParameters.phone);
        if (!isValidPhone(phone)) {
            return { statusCode: 400, body: JSON.stringify({ error: "เบอร์โทรไม่ถูกต้อง" }) };
        }
        const member = await store.get(phone, { type: "json" });
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ member: member || null })
        };
    }

    if (event.httpMethod === "POST") {
        let body;
        try {
            body = JSON.parse(event.body || "{}");
        } catch (e) {
            return { statusCode: 400, body: JSON.stringify({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }) };
        }

        const name = String(body.name || "").trim().slice(0, MAX_NAME_LENGTH);
        const phone = normalizePhone(body.phone);

        if (!name) {
            return { statusCode: 400, body: JSON.stringify({ error: "กรุณากรอกชื่อ" }) };
        }
        if (!isValidPhone(phone)) {
            return { statusCode: 400, body: JSON.stringify({ error: "เบอร์โทรไม่ถูกต้อง กรุณากรอก 9-10 หลัก" }) };
        }

        const existing = await store.get(phone, { type: "json" });

        const member = {
            phone,
            name: existing ? existing.name : name,  
            joinedAt: existing ? existing.joinedAt : new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
        };
 
        if (existing && name && name !== existing.name) {
            member.name = name;
        }

        await store.setJSON(phone, member);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ member, isNewMember: !existing })
        };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
};
