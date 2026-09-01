const bcrypt = require("bcryptjs");
const pool = require("./src/database/db");

const createCollector = async () => {
    try {
        const fullName = "John Collector";
        const phoneNumber = "0911223344";
        const email = "collector@example.com";
        const password = "Collector@123";
        const kifleKetema = "Bole";

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO collectors
            (full_name, phone_number, email, password_hash, kifle_ketema)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, full_name, phone_number, email, kifle_ketema, created_at
        `;

        const result = await pool.query(query, [
            fullName,
            phoneNumber,
            email,
            hashedPassword,
            kifleKetema,
        ]);

        console.log("Collector created successfully:");
        console.log(result.rows[0]);
        console.log("\nLogin credentials:");
        console.log(`  Email: ${email}`);
        console.log(`  Password: ${password}`);
    } catch (error) {
        console.error("Error creating collector:", error.message);
    } finally {
        await pool.end();
    }
};

createCollector();
