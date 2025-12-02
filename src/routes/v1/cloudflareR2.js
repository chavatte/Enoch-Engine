import express from "express";
import multer from "multer";
import os from "os";
import auth from "../../middleware/auth.js";
import {
  listR2Files,
  uploadR2File,
  deleteR2File,
} from "../../controllers/v1/cloudflareR2.js";

const cloudflareR2 = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

cloudflareR2.get("/r2-browser", auth, listR2Files);
cloudflareR2.post("/upload", auth, upload.single("r2file"), uploadR2File);
cloudflareR2.delete("/file", auth, deleteR2File);

export default cloudflareR2;
