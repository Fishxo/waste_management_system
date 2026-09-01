
//validating the user data 
exports.registerResident = (req, res, next) => {
    
    const { firstName,lastName, email, password,phoneNumber,kifleKetema,kebele,sefer} = req.body;
     if (!firstName || 
         !lastName ||
        !email || 
        !password ||
        !phoneNumber ||
        !kifleKetema ||
        !kebele ||
        !sefer 
        ) {
        return res.status(400).json({
            message: "all field are required",
        });
    }
    //checking the name validation 
    if (firstName.length < 3) {
        return res.status(400).json({
            message: "first name should be at least 3 character"
        });
    }
    if (lastName.length < 3) {
        return res.status(400).json({
            message: "last name should be at least 3 character"
        });
    }
    
    //checking the phone number validation
    if (!/^(09|07)\d{8}$/.test(phoneNumber)) {
        return res.status(400).json({
            message : "phone number should be 10 character and should start with 09 or 07"
        })
    }
    next();
}

exports.loginResident = (req, res, next) => {
    const { identifier, email, password } = req.body;

    if ((!identifier && !email) || !password) {
        return res.status(400).json({
            message: "Phone/email and password are required",
        });
    }
    next();
};
 //registration for business owner
exports.registerBusinessOwner = (req, res, next) => {
    const {
        businessName,
        ownerName,
        email,
        password,
        phoneNumber,
        address,
        businessType,
        kebele,
        kifleKetema,
    } = req.body;

    if (
        !businessName ||
        !ownerName ||
        !email ||
        !password ||
        !phoneNumber ||
        !address ||
        !businessType ||
        !kebele ||
        !kifleKetema
    ) {
        return res.status(400).json({
            message: "all field are required",
        });
    }

    if (ownerName.length < 3) {
        return res.status(400).json({
            message: "owner name should be at least 3 character",
        });
    }

    if (businessName.length < 2) {
        return res.status(400).json({
            message: "business name should be at least 2 character",
        });
    }

    if (!/^(09|07)\d{8}$/.test(phoneNumber)) {
        return res.status(400).json({
            message: "phone number should be 10 character and should start with 09 or 07",
        });
    }

    next();
};
 //login for business owner
exports.loginBusinessOwner = (req, res, next) => {
    const { identifier, email, password } = req.body;

    if ((!identifier && !email) || !password) {
        return res.status(400).json({
            message: "Phone/email and password are required",
        });
    }

    next();
};