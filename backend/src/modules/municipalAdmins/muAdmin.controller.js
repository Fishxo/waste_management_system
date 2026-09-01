const adminService = require("./muAdmin.service");
const { getAdminKifleKetema } = require("../../utils/adminScope");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await adminService.login(
            email,
            password
        );

        res.status(200).json({
            message: "Admin login successful",
            data: admin,
        });

    } catch (err) {
        if (err.message === "Invalid email or password") {
            return res.status(401).json({
                message: err.message,
            });
        }

        console.log("ADMIN LOGIN ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//making an update report
exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = req.user.id;

        const report = await adminService.updateReportStatus(
            id,
            status,
            adminId
        );

        res.status(200).json({
            message: "Report status updated successfully",
            data: report,
        });

    } catch (err) {
        if (err.message === "Report not found") {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        console.log("UPDATE REPORT STATUS ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//get whole reports 
exports.getAllReports = async (req, res) => {
    try {
        const { status } = req.query;
        const kifleKetema = getAdminKifleKetema(req);

        const reports = await adminService.getAllReports(status, kifleKetema);

        res.status(200).json({
            message: "Reports retrieved successfully",
            data: reports,
        });

    } catch (err) {
        console.log("GET ALL REPORTS ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//getting the admin dashboard numbers 
exports.getDashboardStatistics = async (req, res) => {
    try {
        const kifleKetema = getAdminKifleKetema(req);
        const statistics = await adminService.getDashboardStatistics(kifleKetema);

        res.status(200).json({
            message: "Dashboard statistics retrieved successfully",
            data: statistics,
        });

    } catch (err) {
        console.log("GET DASHBOARD STATISTICS ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//getting the whole resident 
exports.getAllResidents = async (req, res) => {
    try {
        const kifleKetema = getAdminKifleKetema(req);
        const residents = await adminService.getAllResidents(kifleKetema);

        res.status(200).json({
            message: "Residents retrieved successfully",
            data: residents,
        });

    } catch (err) {
        console.log("GET RESIDENTS ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//getting the resident by its id 
exports.getResidentById = async (req, res) => {
    try {
        const { id } = req.params;
        const kifleKetema = getAdminKifleKetema(req);

        const resident = await adminService.getResidentById(id, kifleKetema);

        if (!resident) {
            return res.status(404).json({
                message: "Resident not found",
            });
        }

        res.status(200).json({
            message: "Resident retrieved successfully",
            data: resident,
        });

    } catch (err) {
        console.log("GET RESIDENT BY ID ERROR:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

//making delete the resident from the admin dashbourd 
exports.deleteResident = async (req, res) => {
  try {
    const { id } = req.params;
    const kifleKetema = getAdminKifleKetema(req);

    const resident = await adminService.deleteResident(id, kifleKetema);

    res.status(200).json({
      message: "Resident deleted successfully",
      data: resident,
    });
  } catch (error) {
    if (error.message === "Resident not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//making deactivate the resident account 
exports.deactivateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const kifleKetema = getAdminKifleKetema(req);

    const resident = await adminService.setResidentActive(id, false, kifleKetema);

    res.status(200).json({
      message: "Resident account deactivated successfully",
      data: resident,
    });
  } catch (error) {
    if (error.message === "Resident not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//making activate the resident account 
exports.activateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const kifleKetema = getAdminKifleKetema(req);

    const resident = await adminService.setResidentActive(id, true, kifleKetema);

    res.status(200).json({
      message: "Resident account activated successfully",
      data: resident,
    });
  } catch (error) {
    if (error.message === "Resident not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getAllBusinessOwners = async (req, res) => {
  try {
    const kifleKetema = getAdminKifleKetema(req);
    const owners = await adminService.getAllBusinessOwners(kifleKetema);

    res.status(200).json({
      message: "Business owners retrieved successfully",
      data: owners,
    });
  } catch (err) {
    console.log("GET BUSINESS OWNERS ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getBusinessOwnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const kifleKetema = getAdminKifleKetema(req);

    const owner = await adminService.getBusinessOwnerById(id, kifleKetema);

    if (!owner) {
      return res.status(404).json({
        message: "Business owner not found",
      });
    }

    res.status(200).json({
      message: "Business owner retrieved successfully",
      data: owner,
    });
  } catch (err) {
    console.log("GET BUSINESS OWNER BY ID ERROR:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.deleteBusinessOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const kifleKetema = getAdminKifleKetema(req);

    const owner = await adminService.deleteBusinessOwner(id, kifleKetema);

    res.status(200).json({
      message: "Business owner deleted successfully",
      data: owner,
    });
  } catch (error) {
    if (error.message === "Business owner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.deactivateBusinessOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const kifleKetema = getAdminKifleKetema(req);

    const owner = await adminService.setBusinessOwnerActive(
      id,
      false,
      kifleKetema
    );

    res.status(200).json({
      message: "Business owner account deactivated successfully",
      data: owner,
    });
  } catch (error) {
    if (error.message === "Business owner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.activateBusinessOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const kifleKetema = getAdminKifleKetema(req);

    const owner = await adminService.setBusinessOwnerActive(
      id,
      true,
      kifleKetema
    );

    res.status(200).json({
      message: "Business owner account activated successfully",
      data: owner,
    });
  } catch (error) {
    if (error.message === "Business owner not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};