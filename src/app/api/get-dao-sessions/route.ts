import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

export async function POST(req: NextRequest, res: NextResponse) {
  const { operator_or_avs, address } = await req.json();
  // console.log(operator_or_avs, address);

  try {
    const client = await connectDB();

    const db = client.db();
    const collection = db.collection("meetings");

    let query: any = { operator_or_avs };

    // Check if address is provided
    if (address !== "") {
      query = {
        operator_or_avs: operator_or_avs,
        host_address: { $regex: new RegExp(`^${address}$`, "i") },
      };
    }

    const documents = await collection.find(query).toArray();

    client.close();

    return NextResponse.json(
      { success: true, data: documents },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
