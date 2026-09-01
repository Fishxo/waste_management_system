const bcrypt = require("bcryptjs");
const pool = require("./src/database/db");

const createSystemAdmin = async () => {
    try {
        const username = "sysadmin";
        const email = "sysadmin@example.com";
        const password = "SysAdmin@123";

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
            INSERT INTO system_admins (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at
            `,
            [username, email, hashedPassword]
        );

        console.log("System admin created successfully:");
        console.log(result.rows[0]);
        console.log("Login with:", email, "/", password);
    } catch (error) {
        console.error("Error creating system admin:", error.message);
    } finally {
        await pool.end();
    }
};

createSystemAdmin();
