import axios from 'axios';
import qs from 'qs';
import { env } from '../config/environment.js';
import { getVerifierByState } from '../services/zaloOA.service.js';

export const WebhookController = {
    async handleEnvent(req, res) {
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
    },

    async handleCallback(req, res) {
        try {
            const { code, oa_id, state } = req.query;
            console.log("🔑 Authorization code:", code);
            console.log("OA ID:", oa_id, "State:", state);

            const code_verifier = await getVerifierByState(state);
            if (!code_verifier) {
                return res.status(400).send("Không tìm thấy code_verifier, có thể đã hết hạn");
            }

            const response = await axios.post(
                "https://oauth.zaloapp.com/v4/oa/access_token",
                qs.stringify({
                    code,
                    app_id: env.ZALO_APP_ID,
                    grant_type: "authorization_code",
                    code_verifier
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        secret_key: env.ZALO_SECRET_KEY
                    }
                }
            );

            console.log("✅ Token:", response.data);

            await saveZaloToken(
                oa_id,
                response.data.access_token,
                response.data.refresh_token,
                parseInt(response.data.expires_in)
            );

            res.send("OA liên kết thành công, token đã lưu!");
        } catch (err) {
            console.error("❌ Callback error:", err.response?.data || err.message);
            res.status(500).send("Lỗi khi lấy token");
        }
    }
};
