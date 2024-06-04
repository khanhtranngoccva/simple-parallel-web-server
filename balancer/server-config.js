module.exports = {
    redirect: Array.from({length: 20}, (_, i) => {
        return `http://server:${i + 9000}`
    }),
    http: {
        port: 80,
    },
    https: {
        port: 443,
        key: "/etc/ssl/private/dev.key",
        cert: "/etc/ssl/cert/dev.crt",
    }
}
