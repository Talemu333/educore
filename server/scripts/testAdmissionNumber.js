require("dotenv").config();

const generateAdmissionNumber = require("../utils/admissionNumberGenerator");

(async () => {

    const result = await generateAdmissionNumber();

    console.log(result);

    process.exit();

})();