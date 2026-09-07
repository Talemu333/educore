const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = Number.isInteger(err.statusCode)
        ? err.statusCode
        : 500;

    const isProduction = process.env.NODE_ENV === "production";
    const message = isProduction && statusCode >= 500
        ? "Internal Server Error"
        : (err.message || "Internal Server Error");

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;
