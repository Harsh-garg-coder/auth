import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// 32-byte key (.env me hex ke roop me, DB se alag rakha jaata hai)
const KEY = Buffer.from(process.env.MFA_ENCRYPTION_KEY, "hex");

// plaintext -> "iv:authTag:ciphertext" (sab hex)
export const encrypt = (plaintext) => {
    const iv = crypto.randomBytes(12); // GCM ke liye 12-byte iv standard hai
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
};

// "iv:authTag:ciphertext" -> plaintext
export const decrypt = (payload) => {
    const [ivHex, tagHex, dataHex] = payload.split(":");

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex")); // tamper hua to .final() throw karega

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataHex, "hex")),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
};
