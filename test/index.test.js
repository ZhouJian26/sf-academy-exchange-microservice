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

test("Exchange with a invalid currency EUR1", () => {
  const client = new exchange_proto.Exchange(
    "localhost:9000",
    grpc.credentials.createInsecure()
  );
  client.exchange({ value: 100, from: "EUR1", to: "USD" }, (err, response) => {
    expect(err.details).toBe("Invalid currency");
  });
});

test("Exchange without a currency", () => {
  const client = new exchange_proto.Exchange(
    "localhost:9000",
    grpc.credentials.createInsecure()
  );
  client.exchange({ value: 100, to: "USD" }, (err, response) => {
    expect(err.details).toBe("Missing value or currency");
  });
});

test("Exchange without a value", () => {
  const client = new exchange_proto.Exchange(
    "localhost:9000",
    grpc.credentials.createInsecure()
  );
  client.exchange({ from: "EUR", to: "USD" }, (err, response) => {
    expect(err.details).toBe("Missing value or currency");
  });
});

test("Exchange self", () => {
  const client = new exchange_proto.Exchange(
    "localhost:9000",
    grpc.credentials.createInsecure()
  );
  client.exchange({ value: 123, from: "USD", to: "USD" }, (err, response) => {
    expect(err).toBe(null);
    expect(response.value).toBe(123);
  });
});

test("Exchange", () => {
  const client = new exchange_proto.Exchange(
    "localhost:9000",
    grpc.credentials.createInsecure()
  );
  client.exchange({ value: 2.0, from: "EUR", to: "USD" }, (err, response) => {
    expect(err).toBe(null);
    expect(response.value).not.toBe(0);
  });
});
