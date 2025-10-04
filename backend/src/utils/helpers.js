const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const getUniqIdValue = (prefix = "", useHash = false) => {
  const uuid = uuidv4();

  const timestamp = Date.now().toString();
  const randomValue = Math.random().toString(36).substring(2, 15);

  if (useHash) {
    const hash = crypto
      .createHash("sha256")
      .update(uuid + timestamp + randomValue)
      .digest("hex")
      .substring(0, 20);

    return prefix + hash;
  }
  return prefix + uuid;
};

const generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  return {
    token,
    expiresAt,
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const formatErrorResponse = (message, status = 400) => {
  return {
    status: "error",
    message,
    code: status,
  };
};

const formatSuccessResponse = (message, data = {}) => {
  return {
    status: "success",
    message,
    data,
  };
};

module.exports = {
  getUniqIdValue,
  generateVerificationToken,
  isValidEmail,
  formatErrorResponse,
  formatSuccessResponse,
};
