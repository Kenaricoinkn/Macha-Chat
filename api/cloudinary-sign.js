import crypto from "crypto";

export default function handler(req, res) {
  try {
    const folder = (req.query.folder || "").toString();
    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = {
      folder,
      timestamp,
      upload_preset: process.env.CLOUD_PRESET, // contoh: "ml_default"
    };

    const toSign =
      Object.keys(paramsToSign)
        .sort()
        .map((k) => `${k}=${paramsToSign[k]}`)
        .join("&") + process.env.CLOUD_API_SECRET;

    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    res.status(200).json({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      upload_preset: process.env.CLOUD_PRESET,
      timestamp,
      folder,
      signature,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
