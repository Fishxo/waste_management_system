const adminService = require("./muAdmin.service");

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

        const reports = await adminService.getAllReports(status);

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
        const statistics = await adminService.getDashboardStatistics();

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
        const residents = await adminService.getAllResidents();

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

        const resident = await adminService.getResidentById(id);

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

    const resident = await adminService.deleteResident(id);

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

    const resident = await adminService.setResidentActive(id, false);

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

    const resident = await adminService.setResidentActive(id, true);

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