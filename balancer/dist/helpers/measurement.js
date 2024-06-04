"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.measure = void 0;
async function measure(callback) {
    console.log("Starting measurement.");
    const start = performance.now();
    const result = await callback();
    const end = performance.now();
    const timeTaken = end - start;
    console.log(result);
    return {
        result: result,
        timeTaken: timeTaken,
    };
}
exports.measure = measure;
