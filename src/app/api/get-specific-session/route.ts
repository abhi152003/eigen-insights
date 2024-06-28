// Import necessary modules and interfaces
import { connectDB } from "@/config/connectDB";
import { NextResponse, NextRequest } from "next/server";

// Define the response body type
interface Session {
  booking_status: string;
  operator_or_avs: string;
  description: string;
  host_address: string;
  joined_status: string;
  meetingId: string;
  meeting_status: string;
  slot_time: string;
  title: string;
  user_address: string;
  _id: string;
}

export async function POST(req: NextRequest, res: NextResponse<Session[]>) {
  try {
    const { operator_or_avs, host_address } = await req.json();

    // Connect to MongoDB database
    // console.log("Connecting to MongoDB...");
    const client = await connectDB();
    // console.log("Connected to MongoDB");

    // Access the collection
    const db = client.db();
    const collection = db.collection("meetings");

    const SessionData = await collection
      .find({ operator_or_avs: operator_or_avs, host_address: host_address })
      .toArray();

    client.close();
    // console.log("MongoDB connection closed");

    return NextResponse.json(SessionData, { status: 200 });
  } catch (error) {
    console.error(`Error fetching Session Data:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
