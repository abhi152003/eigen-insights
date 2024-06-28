import { connectDB } from "@/config/connectDB";
import { NextRequest, NextResponse } from "next/server";

// Define the response body type
interface OfficeHours {
  _id: string;
  host_address: string;
  office_hours_slot: Date;
  title: string;
  description: string;
  meeting_status: string;
  operator_or_avs: string;
}

export async function POST(req: NextRequest, res: NextResponse<OfficeHours[]>) {
  try {
    // Extract the operator_or_avs from the request body
    const { operator_or_avs } = await req.json();

    // Validate the operator_or_avs
    if (!operator_or_avs || typeof operator_or_avs !== "string") {
      return NextResponse.json(
        { error: "Invalid chain name parameter" },
        { status: 400 }
      );
    }

    // Connect to MongoDB database
    const client = await connectDB();

    // Access the collection
    const db = client.db();
    const collection = db.collection<OfficeHours>("office_hours");

    // Find office hours documents based on the provided operator_or_avs
    const officeHours = await collection.find({ operator_or_avs: operator_or_avs }).toArray();

    client.close();

    return NextResponse.json(officeHours, { status: 200 });
  } catch (error) {
    console.error("Error fetching office hours:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest, res: NextResponse<OfficeHours[]>) {
  try {
    // Connect to MongoDB database
    const client = await connectDB();

    // Access the collection
    const db = client.db();
    const collection = db.collection<OfficeHours>("office_hours");

    // Find all office hours documents
    const officeHours = await collection.find().toArray();

    client.close();

    return NextResponse.json(officeHours, { status: 200 });
  } catch (error) {
    console.error("Error fetching office hours:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
