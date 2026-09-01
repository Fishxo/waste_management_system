function getAdminKifleKetema(req) {
    return req.user?.kifleKetema || null;
}

module.exports = { getAdminKifleKetema };
