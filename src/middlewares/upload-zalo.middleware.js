import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            const conversationId = req.body.conversationId;
            

            const currentDate = new Date().toISOString().split("T")[0];
            const uploadDir = path.join(
                process.cwd(),
                "uploadeds",
                "zalo",
                conversationId,
                currentDate
            );
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        } catch (err) {
            cb(err);
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + ext);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (
        allowedMimeTypes.includes(file.mimetype) ||
        file.mimetype.startsWith("text/")
    ) {
        cb(null, true);
    } else {
        cb(
            new Error("Chỉ chấp nhận file ảnh, văn bản (.txt), PDF và Word (.docx)"),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// Middleware wrapper: fields thay vì single
export const uploadZaloImage = (req, res, next) => {
    const fields = [
        { name: "file", maxCount: 10 }
    ];

    upload.fields(fields)(req, res, (err) => {
        if (err) {
            return next(err);
        }

        // normalize để giữ API giống single
        if (req.files && req.files.file) {
            req.file = req.files.file[0];
        }

        next();
    });
};

export default uploadZaloImage;
