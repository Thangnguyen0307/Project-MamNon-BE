import webhookZaloService from '../../services/zalo/webhook-zaloOA.service.js';

export const WebhookController = {
    async handleEnvent(req, res) {
        try {
            const event = req.body;
            await webhookZaloService.handleEnvent(event);
            res.sendStatus(200);
        } catch (err) {
            console.error("Webhook error:", err);
            res.sendStatus(500);
        }
    },

    async handleCallback(req, res) {
        try {
            const { code, oa_id, state } = req.query;
            console.log("🔑 Authorization code:", code);
            console.log("OA ID:", oa_id, "State:", state);

            await webhookZaloService.handleCallBack(code, oa_id, state);

            res.send("OA liên kết thành công, token đã lưu!");
        } catch (err) {
            console.error("❌ Callback error:", err.response?.data || err.message);
            res.status(500).send("Lỗi khi lấy token");
        }
    }
};
