const fs = require("fs");
const { parse } = require("csv-parse");
const psl = require("psl");

async function getTopDomains() {
  return new Promise((resolve, reject) => {
    let data = [];
    let counter = 0;
    const csvStream = parse({ delimiter: "," });
    csvStream.on("data", (row) => {
      const parsed = psl.parse(row[1]);
      if (!data.includes(parsed.sld)) {
        data.push(parsed.sld);
      }
      counter++;
      if (data.length === 10000) {
        csvStream.end();
      }
    });
    csvStream.on("end", () => {
      resolve(data);
    });
    csvStream.on("error", (error) => {
      reject(error);
    });
    fs.createReadStream("./scripts/domains/top-1m.csv").pipe(csvStream);
  });
}
exports.getTopDomains = getTopDomains;
