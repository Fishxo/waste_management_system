const bcrypt = require("bcryptjs");
const pool = require("./src/database/db");

const createAdmin = async () => {
    try {
        const username = "municipaladmin";
        const email = "admin@example.com";
        const password = "Admin@123";

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO municipal_admins
            (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at
        `;

        const result = await pool.query(query, [
            username,
            email,
            hashedPassword
        ]);

        console.log("Admin created successfully:");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("Error creating admin:", error);

    } finally {
        await pool.end();
    }
};

createAdmin();