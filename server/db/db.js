const Sequelize = require("sequelize");
const fs = require("fs");
const pkg = require("../../package.json");
// let ssl = null;
// if (process.env.NODE_ENV === "development") {
//   ssl = { rejectUnauthorized: false };
// }

const postgresUri =
  "postgres://avnadmin:AVNS_lQWgatDcyFJwjcjxX3o@bullseyestore-yingsonyu-f68d.aivencloud.com:24026/defaultdb?sslmode=require";
const conn = new URL(postgresUri);
conn.search = conn.query = "";

const databaseName =
  pkg.name + (process.env.NODE_ENV === "test" ? "-test" : "");

// const config = {
//   logging: false,
// };

if (process.env.LOGGING === "true") {
  delete config.logging;
}

// //https://stackoverflow.com/questions/61254851/heroku-postgres-sequelize-no-pg-hba-conf-entry-for-host
// if (process.env.DATABASE_URL) {
//   config.dialectOptions = {
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   };
// }

const config = {
  connectionString: conn.href,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca.cer").toString(),
  },
  logging: false,
  dialect: "postgres",
};

const db = new Sequelize(
  // process.env.DATABASE_URL ||
  config
);

try {
  async () => {
    await db.authenticate();
    console.log("successfully connected");
  };
} catch (error) {
  console.log("connection refused");
}
module.exports = db;
