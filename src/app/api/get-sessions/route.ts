import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/connectDB";

export async function POST(req: NextRequest, res: NextResponse) {
  const { address, operator_or_avs } = await req.json();

  //   console.log("address", address);
  //   console.log("operator_or_avs", operator_or_avs);

  try {
    const client = await connectDB();

    try {
      const db = client.db();
      const meetingsCollection = db.collection("meetings");
      const attestationsCollection = db.collection("attestation");

      const hostedMeetings = await meetingsCollection
        .find({
          operator_or_avs,
          host_address: address,
          meeting_status: "Recorded",
        })
        .toArray();

      const mergedHostedMeetings = await Promise.all(
        hostedMeetings.map(async (meeting) => {
          const { meetingId } = meeting;

          // Find documents in the "attestation" collection with matching roomId
          const attestations = await attestationsCollection
            .find({ roomId: meetingId })
            .toArray();

          // Merge attestation documents into the meeting document
          const mergedMeeting = {
            ...meeting,
            attestations,
          };

          return mergedMeeting;
        })
      );

      const attendedMeetings = await meetingsCollection
        .find({
          operator_or_avs,
          meeting_status: "Recorded",
          "attendees.attendee_address": address,
        })
        .toArray();

      const mergedAttendedMeetings = await Promise.all(
        attendedMeetings.map(async (meeting) => {
          const { meetingId } = meeting;

          // Find documents in the "attestation" collection with matching roomId
          const attestations = await attestationsCollection
            .find({ roomId: meetingId })
            .toArray();

          // Merge attestation documents into the meeting document
          const mergedMeeting = {
            ...meeting,
            attestations,
          };

          return mergedMeeting;
        })
      );

      return NextResponse.json(
        {
          success: true,
          hostedMeetings: mergedHostedMeetings,
          attendedMeetings: mergedAttendedMeetings,
        },
        { status: 200 }
      );
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
