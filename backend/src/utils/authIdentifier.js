function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function normalizeIdentifier(value) {
    return String(value).trim();
}

module.exports = { isEmail, normalizeIdentifier };
