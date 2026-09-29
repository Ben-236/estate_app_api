import multer, { Options } from "multer";
import path from "path"
import fs from "fs"
import ErrorWithCode from "../../utils/ErrorWithCode";
import { Request } from "express";
import { generateSecureRandomString } from "../../utils/function";

const maxSize = 10 * 1024 * 1024

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = path.join(__dirname, '../../uploads/');

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        cb(null, folderPath)
    },
    filename: function (req, file, cb) {
        const randomName = generateSecureRandomString(16);
        cb(null, randomName)
    }
})

export const imageFileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new ErrorWithCode("File must be a JPG, JPEG, PNG, WEBP, PDF, DOC or DOCX"));
    }

    cb(null, true);
};

export const upload = (options: Options) => multer({
    storage: storage,
    limits: { fileSize: maxSize },
    ...options,
})

export default upload