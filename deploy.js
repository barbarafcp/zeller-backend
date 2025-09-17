#!/usr/bin/env node
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");

const mode = process.argv[2] || "build"; // build | start | all
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const hasScript = (s) => pkg.scripts && Object.prototype.hasOwnProperty.call(pkg.scripts, s);

async function run(cmd) {
  console.log(`$ ${cmd}`);
  const { stdout, stderr } = await exec(cmd, { env: process.env });
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}

async function main() {
  if (mode === "build" || mode === "all") {
    console.log("Installing dependencies...");
    try { 
      await run("npm ci"); 
    } catch {
      await run("npm install");
    }

    console.log("Building TypeScript...");
    await run("npm run build");

    console.log("Running Sequelize migrations...");
    await run("npx sequelize-cli db:migrate --config src/config/config.js --migrations-path src/migrations --models-path src/models --seeders-path src/seeders");

    console.log("Clearing Clients table...");
    await run(`npx sequelize-cli db:seed:execute --config src/config/config.js --seeders-path src/seeders --sql 'TRUNCATE TABLE "Clients" RESTART IDENTITY CASCADE;'`);

    console.log("Seeding database...");
    await run("npx sequelize-cli db:seed:all --config src/config/config.js --migrations-path src/migrations --models-path src/models --seeders-path src/seeders");
  }

  if (mode === "start" || mode === "all") {
    console.log("Starting server...");
    process.env.PORT = process.env.PORT || "3000";
    await run("npm start");
  }
}

main().catch((err) => {
  console.error("Deploy script failed:", err.message || err);
  process.exit(1);
});
