import argparse from "argparse";
import * as child_process from "child_process";
import {ChildProcess} from "node:child_process";
import emitter from "events";

const parser = new argparse.ArgumentParser();
parser.add_argument("-s", "--start", {
  required: true,
  dest: "start",
  type: Number,
});
parser.add_argument("-e", "--end", {
  required: true,
  dest: "end",
  type: Number,
});
parser.add_argument("-t", "--target", {
  required: true,
  dest: "target",
  type: String,
});

interface Arguments {
  start: number,
  target: string,
  end: number,
}

const args: Arguments = parser.parse_args();

async function main() {
  let processes: ChildProcess[] = [];

  for (let port = args.start; port <= args.end; port++) {
    if (!Number.isInteger(port)) {
      throw new Error("Check your input. Port number input is not an integer.");
    }
    let childProc: ChildProcess;
    childProc = child_process.spawn("tsx", [
      args.target,
      "-p",
      port.toString(),
    ], {
    });

    processes.push(childProc);
  }

  const exitPromises = processes.map(((childProc, index) => {
    emitter.setMaxListeners(processes.length * 5);

    return new Promise<void>((resolve) => {
      let timeout: NodeJS.Timeout | number;

      // Exit cleanup.
      childProc.once("exit", exitChild);

      function terminate() {
        childProc.kill("SIGTERM");
        timeout = setTimeout(() => {
          childProc.kill("SIGKILL");
        }, 5000);
      }

      function interrupt() {
        childProc.kill("SIGINT");
      }

      function writeStdout(data: ArrayBuffer) {
        process.stdout.write(`[WORKER ${index}]: `);
        const line = data.toString();
        process.stdout.write(line);
        if (!line.endsWith("\n")) {
          process.stdout.write("\n");
        }
      }

      function writeStderr(data: ArrayBuffer) {
        process.stderr.write(`[WORKER ${index}]: `);
        const line = data.toString();
        process.stderr.write(line);
        if (!line.endsWith("\n")) {
          process.stderr.write("\n");
        }
      }

      function exitChild(code: number|null) {
        console.log(`Worker ${index} exited with code ${code}`);
        clearTimeout(timeout);
        process.off("SIGTERM", terminate);
        process.off("SIGINT", interrupt);
        childProc.off("exit", exitChild);
        childProc.stdout?.off("data", writeStdout);
        childProc.stderr?.off("data", writeStderr);
        resolve();
      }

      // Terminate logic. Kills after a few seconds.
      process.on("SIGTERM", terminate);
      process.on("SIGINT", interrupt);
      childProc.stdout?.on("data", writeStdout);
      childProc.stderr?.on("data", writeStderr);
    });
  }));

  await Promise.all(exitPromises);
  console.log("Exiting pool execution.");
}

main().then();