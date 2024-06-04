module.exports = {
    redirect: Array.from({length: 20}, (_, i) => {
        return `http://localhost:${i + 9000}`
    })
}