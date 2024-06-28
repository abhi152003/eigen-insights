import { NextRequest, NextResponse } from "next/server";
import { MongoClient, MongoClientOptions } from "mongodb";
import { connectDB } from "@/config/connectDB";

type Params = {
  operator_or_avs: string;
};

export async function GET(req: NextRequest, context: { params: Params }) {
  const operator_or_avs = context.params.operator_or_avs;
  console.log(operator_or_avs);
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    const client = await connectDB();
    console.log("Connected to MongoDB");

    // Access both collections
    const db = client.db();
    const collection = db.collection("dao_details");

    const documents = await collection.find({ operator_or_avs }).toArray();

    client.close();

    // Return the found documents
    return NextResponse.json(
      { success: true, data: documents },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error retrieving data in meeting session data by id:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
