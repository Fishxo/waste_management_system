const express = require("express");
const router = express.Router();
const systemAdminController = require("./systemAdmin.controller");
const systemAdminValidation = require("./systemAdmin.validation");
const {
    authenticateSystemAdmin,
} = require("../../middleware/systemAdminAuth.middleware");

router.post("/login", systemAdminValidation.login, systemAdminController.login);

router.get(
    "/dashboard",
    authenticateSystemAdmin,
    systemAdminController.getDashboardStats
);

router.get(
    "/municipal-admins",
    authenticateSystemAdmin,
    systemAdminController.getMunicipalAdmins
);

router.post(
    "/municipal-admins",
    authenticateSystemAdmin,
    systemAdminValidation.createMunicipalAdmin,
    systemAdminController.createMunicipalAdmin
);

router.put(
    "/municipal-admins/:id",
    authenticateSystemAdmin,
    systemAdminValidation.updateMunicipalAdmin,
    systemAdminController.updateMunicipalAdmin
);

router.get(
    "/collectors",
    authenticateSystemAdmin,
    systemAdminController.getCollectors
);

router.post(
    "/collectors",
    authenticateSystemAdmin,
    systemAdminValidation.createCollector,
    systemAdminController.createCollector
);

router.put(
    "/collectors/:id",
    authenticateSystemAdmin,
    systemAdminValidation.updateCollector,
    systemAdminController.updateCollector
);

router.patch(
    "/collectors/:id/activate",
    authenticateSystemAdmin,
    systemAdminController.activateCollector
);

router.patch(
    "/collectors/:id/deactivate",
    authenticateSystemAdmin,
    systemAdminController.deactivateCollector
);

router.get(
    "/residents",
    authenticateSystemAdmin,
    systemAdminController.getResidents
);

router.patch(
    "/residents/:id/activate",
    authenticateSystemAdmin,
    systemAdminController.activateResident
);

router.patch(
    "/residents/:id/deactivate",
    authenticateSystemAdmin,
    systemAdminController.deactivateResident
);

router.get(
    "/business-owners",
    authenticateSystemAdmin,
    systemAdminController.getBusinessOwners
);

router.patch(
    "/business-owners/:id/activate",
    authenticateSystemAdmin,
    systemAdminController.activateBusinessOwner
);

router.patch(
    "/business-owners/:id/deactivate",
    authenticateSystemAdmin,
    systemAdminController.deactivateBusinessOwner
);

router.post(
    "/backup",
    authenticateSystemAdmin,
    systemAdminController.createBackup
);

router.get(
    "/backups",
    authenticateSystemAdmin,
    systemAdminController.listBackups
);

router.get(
    "/backups/:id/download",
    authenticateSystemAdmin,
    systemAdminController.downloadBackup
);

router.post(
    "/restore",
    authenticateSystemAdmin,
    systemAdminValidation.restoreDatabase,
    systemAdminController.restoreDatabase
);

module.exports = router;
