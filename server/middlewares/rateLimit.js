const buckets = new Map();

function rateLimit({ windowMs = 15 * 60 * 1000, max = 20, message = "Too many requests. Please try again later." } = {}) {
    return (req, res, next) => {
        const ip = req.ip || "unknown";
        const key = `${req.baseUrl || ""}:${req.path}:${ip}`;
        const now = Date.now();
        const current = buckets.get(key);

        if (!current || now >= current.resetAt) {
            buckets.set(key, { count: 1, resetAt: now + windowMs });
            return next();
        }

        current.count += 1;
        if (current.count > max) {
            res.set("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
            return res.status(429).json({ success: false, message });
        }

        return next();
    };
}

setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
        if (now >= bucket.resetAt) buckets.delete(key);
    }
}, 10 * 60 * 1000).unref();

module.exports = rateLimit;
