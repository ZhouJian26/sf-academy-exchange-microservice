const PROTO_PATH = __dirname + "/../sf-academy-proto/src/exchange.proto";

const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: false,
  oneofs: true,
});
const exchange_proto = grpc.loadPackageDefinition(packageDefinition).exchange;

(function main() {
  const client = new exchange_proto.Exchange(
    "localhost:9000",
    grpc.credentials.createInsecure()
  );
  client.rates({}, (err, response) => {
    if (err) console.log(err);
    console.log(response);
  });
})();
