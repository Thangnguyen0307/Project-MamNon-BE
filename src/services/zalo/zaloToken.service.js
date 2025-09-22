import axios from "axios";
import qs from 'qs';
import { env } from "../../config/environment.js";
import { ZaloToken } from "../../models/zalo-token.model.js";

export async function saveZaloToken(oaId, accessToken, refreshToken, expiresIn) {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    return await ZaloToken.findOneAndUpdate(
        { oaId },
        { accessToken, refreshToken, expiresAt },
        { new: true, upsert: true }
    );
}

export async function getValidAccessToken(oaId) {
    console.log("Lấy token cho OA ID:", oaId);
    let tokenDoc = await ZaloToken.findOne({ oaId });

    if (!tokenDoc) {
        throw new Error("⚠️ Token chưa được cấp, yêu cầu liên kết OA.");
    }

    const now = new Date();

    // Nếu access_token còn hiệu lực hơn 5 phút, trả về luôn
    if (tokenDoc.expiresAt > new Date(now.getTime() + 5 * 60 * 1000)) {
        return tokenDoc.accessToken;
    }

    // Refresh access_token
    console.log("Access token sắp hết hạn, tiến hành refresh token...");
    console.log("Refresh token document:", tokenDoc.refreshToken);
    const res = await axios.post(
        'https://oauth.zaloapp.com/v4/oa/access_token',
        qs.stringify({
            app_id: env.ZALO_APP_ID,
            grant_type: 'refresh_token',
            refresh_token: tokenDoc.refreshToken,
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'secret_key': env.ZALO_SECRET_KEY,
            },
        }
    );


    const data = res.data;
    console.log("Response from Zalo token refresh:", data);
    tokenDoc.accessToken = data.access_token;
    tokenDoc.refreshToken = data.refresh_token;
    tokenDoc.expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await tokenDoc.save();
    return tokenDoc.accessToken;
}
