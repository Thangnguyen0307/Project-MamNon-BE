import nodemailer from "nodemailer";
import { MailType } from "../constants/mail.constant.js"; // nhớ thêm .js khi import file local
import fs from "fs-extra";
import handlebars from "handlebars";
import { env } from "../config/environment.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
    },
});

async function renderTemplate(fileName, data) {
    try {
        if (!fileName) {
            const err = new Error("Template file is required");
            err.status = 500;
            throw err;
        }
        const layoutUrl = new URL("../templates/emails/layout.html", import.meta.url);
        const templateUrl = new URL(`../templates/emails/${fileName}`, import.meta.url);

        const [layoutHTML, bodyHTML] = await Promise.all([
            fs.readFile(layoutUrl, "utf8"),
            fs.readFile(templateUrl, "utf8"),
        ]);

        const layout = handlebars.compile(layoutHTML);
        const body = handlebars.compile(bodyHTML)(data);

        return layout({ body, ...data, year: new Date().getFullYear() });
    } catch (e) {
        const err = new Error(`Lỗi khi tải mẫu email: ${e.message}`);
        err.status = 500;
        throw err;
    }
}

async function sendMail(to, type, data = {}) {
    let subject = "Thông báo";
    let templateFile = "";

    switch (type) {
        case MailType.RESET_PASSWORD:
            subject = "Khôi phục mật khẩu";
            templateFile = "reset-password.html";
            break;
        default:
            break;
    }

    const html = await renderTemplate(templateFile, data);

    const mailOptions = {
        from: `"Media Mam Non" <${env.MAIL_USER}>`,
        to,
        subject,
        html,
    };

    return transporter.sendMail(mailOptions);
}

export {
    sendMail,
};
