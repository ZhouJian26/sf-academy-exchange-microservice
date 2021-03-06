"use strict";
const PROTO_PATH = __dirname + "/../sf-academy-proto/src/exchange.proto";

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const https = require("https");
const cheerio = require("cheerio");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: false,
  oneofs: true,
});

const exchange_proto = grpc.loadPackageDefinition(packageDefinition).exchange;

const extractData = (page) => {
  const $ = cheerio.load(page, { xmlMode: true });
  const res = { EUR: 1 };
  $("Cube Cube Cube").each((index, e) => {
    res[e.attribs.currency] = parseFloat(e.attribs.rate);
  });
  return res;
};

const getExchanges = () =>
  new Promise((resolve, reject) => {
    const options = {
      host: "www.ecb.europa.eu",
      path:
        "/stats/eurofxref/eurofxref-daily.xml?46f0dd7988932599cb1bcac79a10a16a",
    };
    let page = "";
    https
      .request(options, (res) => {
        res.on("data", (chunk) => {
          page += chunk;
        });
        res.on("end", () => {
          resolve(extractData(page));
        });
        res.on("error", (e) => {
          reject(e);
        });
      })
      .end();
  });

const exchange = (call, callback) => {
  if (
    call.request.value == undefined ||
    call.request.from == undefined ||
    call.request.to == undefined
  )
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "Missing value or currency",
    });
  getExchanges().then((exchanges) => {
    const finalAmount = (
      call.request.value *
      (exchanges[call.request.to] / exchanges[call.request.from])
    ).toFixed(2);
    if (finalAmount == "NaN")
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: "Invalid currency",
      });
    callback(null, {
      value: finalAmount,
      rate: exchanges[call.request.to] / exchanges[call.request.from],
    });
  });
};

const rates = (call, callback) => {
  getExchanges().then((exchanges) => {
    callback(null, { rates: exchanges });
  });
};

(function main() {
  const server = new grpc.Server();
  server.addService(exchange_proto.Exchange.service, {
    exchange: exchange,
    rates: rates,
  });
  server.bind("0.0.0.0:9000", grpc.ServerCredentials.createInsecure());
  server.start();
})();
