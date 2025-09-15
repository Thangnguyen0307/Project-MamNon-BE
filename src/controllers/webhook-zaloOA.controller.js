export const  WebhookController =  {
    async handle(req, res) {
        try {
            const event = req.body;
            console.log("Inbound webhook:", JSON.stringify(event, null, 2));

            // TODO: lưu DB
            // ví dụ: nếu là tin nhắn từ user
            if (event.message && event.sender) {
                const userId = event.sender.id;
                const text = event.message.text;
                console.log(`User ${userId} said: ${text}`);
            }

            res.sendStatus(200);
        } catch (err) {
            console.error("Webhook error:", err);
            res.sendStatus(500);
        }
    }
};
