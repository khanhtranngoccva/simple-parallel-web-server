function waitFrame() {
    return new Promise(r => requestAnimationFrame(r));
}

// const x = 100;
// const y = 100;
// const r = 50;
// const speed = Math.PI / 2;

// async function main() {
//     const start = performance.now();
//     while (true) {
//         const end = performance.now();
//         await waitFrame();
//         const time = (end - start) / 1000;
//         if (time > 20) break;
//         window.moveTo(x + r * speed * Math.cos(time), y + r * speed * Math.sin(time));
//     }
// }

let x = 0;
let y = 0;
let cx = 0;
let cy = 0;


window.onmousemove = ((e) => {
    x = e.screenX;
    y = e.screenY;
})

async function main() {
    const start = performance.now();
    while (true) {
        const end = performance.now();
        await waitFrame();
        const time = (end - start) / 1000;
        if (time > 60) break;
        window.moveTo(
            x - window.outerWidth / 2,
            y - window.outerHeight / 2
        )
    }
}

main();