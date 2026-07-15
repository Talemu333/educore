const bcrypt = require("bcrypt");

async function hashPassword() {

    const password = "admin123";

    const saltRounds = 12;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("Original Password:");
    console.log(password);

    console.log("\nHashed Password:");
    console.log(hashedPassword);
}

hashPassword();