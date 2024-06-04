
async function delay(t) {
    return new Promise(r => setTimeout(r, t * 1000));
}

let concurrency = 0;
let maxConcurrency = 0;
function incConcurrency() {
    concurrency++;
    if (maxConcurrency < concurrency) {
        maxConcurrency = concurrency;
    }
}

function decConcurrency() {
    concurrency--;
}

async function makeRequest(i) {
    incConcurrency();
    let data;
    while (true) {
        try {
            const res=  await fetch("http://localhost:8080", {
                method: "POST",
                body: JSON.stringify({
                    field1: "testField",
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            data = await res.json();
            break;
        } catch (e) {
            console.error(e);
        }
    }
    decConcurrency();
    return data;
}

async function main() {
    const requests = [];
    const count = 80;

    const start = performance.now();

    for (let i = 0; i < count; i++) {
        const request = makeRequest(i);
        if (i % 3 === 0) {
            await delay(0);
        }
        requests.push(request);
    }

    const data = await Promise.all(requests);
    const counter = {};
    for (let jsonData of data) {
        counter[jsonData.hostPort] ??= 0;
        counter[jsonData.hostPort]++;
    }

    console.log(counter);

    const end = performance.now();
    console.log(`Designated concurrency: ${Object.keys(counter).length} requests: ${end - start}ms avg: ${(end - start) / count}ms max concurrency: ${maxConcurrency}`);
}

main().then();