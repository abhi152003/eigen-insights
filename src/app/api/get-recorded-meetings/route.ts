import { NextRequest, NextResponse } from "next/server";
import { MongoClient, MongoClientOptions } from "mongodb";
import { connectDB } from "@/config/connectDB";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Connect to MongoDB
    const client = await connectDB();

    // Access the collections
    const db = client.db();
    const meetingsCollection = db.collection("meetings");
    const delegatesCollection = db.collection("delegates");

    // Fetch all documents from the meetings collection
    const meetings = await meetingsCollection
      .find({ meeting_status: "Recorded" })
      .sort({ slot_time: -1 })
      .toArray();

    // Iterate through each meeting document
    const mergedData = await Promise.all(
      meetings.map(async (session) => {
        // Extract address and operator_or_avs from the meeting
        const { host_address, operator_or_avs, attendees } = session;

        // Query delegates collection based on address and operator_or_avs
        const hostInfo = await delegatesCollection.findOne({
          address: host_address,
          // daoName: operator_or_avs,
        });

        const guestInfo = await delegatesCollection.findOne({
          address: attendees[0]?.attendee_address,
          daoName: operator_or_avs,
        });

        // Return merged data
        return { session, hostInfo, guestInfo };
      })
    );

    client.close();

    // Return the merged data
    return NextResponse.json(
      { success: true, data: mergedData },
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
