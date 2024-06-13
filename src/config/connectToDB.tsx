import { MongoClient, MongoClientOptions } from "mongodb";

export async function connectToDB() {
  const client = await MongoClient.connect(process.env.MONGODB_URI!, {
    dbName: "eigen-insights",
  } as MongoClientOptions);

  return client;
}
