const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const systemAdminRepository = require("./systemAdmin.repository");
const backupService = require("./backup.service");

exports.login = async (email, password) => {
    const admin = await systemAdminRepository.findByEmail(email);

    if (!admin) {
        throw new Error("Invalid email or password");
    }

    if (admin.is_active === false) {
        throw new Error("Your account has been deactivated");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: admin.id,
            role: "system_admin",
            email: admin.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        token,
    };
};

exports.getDashboardStats = async () => {
    const stats = await systemAdminRepository.getDashboardStats();

    return {
        totalResidents: Number(stats.total_residents),
        totalBusinessOwners: Number(stats.total_business_owners),
        totalMunicipalAdmins: Number(stats.total_municipal_admins),
        totalCollectors: Number(stats.total_collectors),
        inactiveResidents: Number(stats.inactive_residents),
        inactiveBusinessOwners: Number(stats.inactive_business_owners),
        inactiveCollectors: Number(stats.inactive_collectors),
    };
};

exports.getMunicipalAdmins = async () => {
    return await systemAdminRepository.getAllMunicipalAdmins();
};

exports.createMunicipalAdmin = async (data) => {
    const passwordHash = await bcrypt.hash(data.password, 10);

    return await systemAdminRepository.createMunicipalAdmin({
        username: data.username,
        email: data.email,
        passwordHash,
        kifleKetema: data.kifleKetema,
    });
};

exports.getCollectors = async () => {
    return await systemAdminRepository.getAllCollectors();
};

exports.createCollector = async (data) => {
    const passwordHash = await bcrypt.hash(data.password, 10);

    return await systemAdminRepository.createCollector({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        passwordHash,
        kifleKetema: data.kifleKetema,
    });
};

exports.setCollectorActive = async (id, isActive) => {
    const collector = await systemAdminRepository.updateCollectorActive(
        id,
        isActive
    );

    if (!collector) {
        throw new Error("Collector not found");
    }

    return collector;
};

exports.getResidents = async () => {
    return await systemAdminRepository.getAllResidents();
};

exports.setResidentActive = async (id, isActive) => {
    const resident = await systemAdminRepository.updateResidentActive(
        id,
        isActive
    );

    if (!resident) {
        throw new Error("Resident not found");
    }

    return resident;
};

exports.getBusinessOwners = async () => {
    return await systemAdminRepository.getAllBusinessOwners();
};

exports.setBusinessOwnerActive = async (id, isActive) => {
    const owner = await systemAdminRepository.updateBusinessOwnerActive(
        id,
        isActive
    );

    if (!owner) {
        throw new Error("Business owner not found");
    }

    return owner;
};

exports.createBackup = async (systemAdminId) => {
    return await backupService.createBackup(systemAdminId);
};

exports.listBackups = async () => {
    return await backupService.listBackups();
};

exports.downloadBackup = async (id) => {
    const backup = await backupService.getBackupById(id);

    if (!backup) {
        throw new Error("Backup not found");
    }

    return backup;
};

exports.restoreDatabase = async (sqlContent, systemAdminId) => {
    if (!sqlContent || !String(sqlContent).trim()) {
        throw new Error("SQL content is required");
    }

    return await backupService.restoreFromSql(sqlContent, systemAdminId);
};
