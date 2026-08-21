// config/permissions.js

const ROLE_NAMES = require("./roleNames");

module.exports = {

    MANAGE_STUDENTS: [

        ROLE_NAMES.ADMIN,

        ROLE_NAMES.REGISTRAR

    ],

    MANAGE_PARENTS: [

        ROLE_NAMES.ADMIN,

        ROLE_NAMES.REGISTRAR

    ],

    MANAGE_TEACHERS: [

        ROLE_NAMES.ADMIN,

        ROLE_NAMES.PRINCIPAL

    ],

    MANAGE_RESULTS: [

        ROLE_NAMES.ADMIN,

        ROLE_NAMES.TEACHER

    ],

    MANAGE_PAYMENTS: [

        ROLE_NAMES.ADMIN,

        ROLE_NAMES.BURSAR

    ]

};