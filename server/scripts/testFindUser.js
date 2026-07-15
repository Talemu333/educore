require("dotenv").config();

const authModel = require("../models/authModel");

async function test() {

    const user = await authModel.findUser("admin");

    console.log(user);

    process.exit();

}

test();