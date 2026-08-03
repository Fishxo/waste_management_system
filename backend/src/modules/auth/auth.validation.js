
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

//for login resident 
exports.loginResident = (req, res, next) => {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
        return res.status(400).json({
            message: "email and password are required",
        });
    }
    next();
}