import "dotenv/config";
import jwt from "jsonwebtoken";

const createToken = (userInfo) => {
    return jwt.sign(userInfo, process.env.JWT_SECRET, {expiresIn: "15m"});
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch(error) {
        console.log(error);
    }
}
const token = createToken({userId: "1"});
const isFirstTokeVerified = verifyToken(token);

const token2 = token + "1";
const isSecondTokeVerified = verifyToken(token2);

console.log(isFirstTokeVerified, isSecondTokeVerified);