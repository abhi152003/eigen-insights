import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

export async function POST(req: NextRequest, res: NextResponse) {
  // console.log("GET req call");
  const query = req.url.split("search-officehours/")[1];

  const { operator_or_avs } = await req.json();
  console.log("Dao name: ", operator_or_avs);

  // console.log(user_address);
  try {
    // Connect to MongoDB
    // console.log("Connecting to MongoDB...");

    const client = await connectDB();
    // console.log("Connected to MongoDB");

    // Access the collection
    const db = client.db();
    const collection = db.collection("office_hours");

    // Find documents based on user_address
    // console.log("Finding documents for user:", user_address);

    let filter: any = {
      $or: [
        { title: { $regex: `\\b${query}`, $options: "i" } },
        { host_address: { $regex: `\\b${query}`, $options: "i" } },
      ],
    };

    if (operator_or_avs) {
      filter = {
        $and: [filter, { operator_or_avs: operator_or_avs }],
      };
    }

    const documents = await collection.find(filter).toArray();
    // console.log("Documents found:", documents);

    client.close();
    // console.log("MongoDB connection closed");

    // Return the found documents
    return NextResponse.json(
      { success: true, data: documents },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data in get session by user:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
