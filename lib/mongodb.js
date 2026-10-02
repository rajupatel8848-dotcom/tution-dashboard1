import { setServers } from "node:dns";
import { MongoClient } from "mongodb";

const options = {};
let clientPromise;

function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI. Set it in your local environment.");
  const dnsServers = process.env.MONGODB_DNS_SERVERS
    ?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  if (dnsServers?.length) setServers(dnsServers);
  return new MongoClient(uri, options).connect();
}

async function getClient() {
  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
      globalThis._mongoClientPromise = connect();
    }
    clientPromise = globalThis._mongoClientPromise;
  } else if (!clientPromise) {
    clientPromise = connect();
  }

  const pendingClient = clientPromise;
  try {
    return await pendingClient;
  } catch (error) {
    if (process.env.NODE_ENV === "development" && globalThis._mongoClientPromise === pendingClient) {
      delete globalThis._mongoClientPromise;
    } else if (clientPromise === pendingClient) {
      clientPromise = undefined;
    }
    throw error;
  }
}

export async function getDatabase() {
  const client = await getClient();
  return process.env.MONGODB_DB
    ? client.db(process.env.MONGODB_DB)
    : client.db();
}
