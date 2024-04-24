// attestOffchain.tsx
import { NextResponse, NextRequest } from "next/server";
import {
  SchemaEncoder,
  EAS,
  NO_EXPIRATION,
  ZERO_BYTES32,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { stringToBytes, bytesToHex } from "viem";

interface MeetingRequestBody {
  host_address: string;
  user_address: string;
  slot_time: string;
  meetingId: string;
  meeting_status: boolean;
  joined_status: boolean;
  booking_status: boolean;
  dao_name: string;
  title: string;
  description: string;
  uid_host: string;
  uid_user: string;
}

interface AttestOffchainRequestBody {
  recipient: string;
  meetingId: string;
  meetingType: number;
  startTime: number;
  endTime: number;
}

interface MyError {
  message: string;
  code?: number;
}

// const allowedOrigin = "http://localhost:3000";
const allowedOrigin = process.env.NEXTAUTH_URL;

const url = process.env.NEXT_PUBLIC_ATTESTATION_URL;
// Set up your ethers provider and signer
const provider = new ethers.JsonRpcProvider(url, undefined, {
  staticNetwork: true,
});
const privateKey = process.env.PVT_KEY ?? "";
const signer = new ethers.Wallet(privateKey, provider);
const eas = new EAS("0x4200000000000000000000000000000000000021");
eas.connect(signer);

export async function POST(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("Origin");
  //   if (origin !== allowedOrigin) {
  //     return NextResponse.json(
  //       { success: false, error: "Unauthorized access" },
  //       { status: 403 }
  //     );
  //   }
  console.log("log1");
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
  const requestData = (await req.json()) as AttestOffchainRequestBody;
  // Your validation logic here

  try {
    console.log("log2");

    const schemaEncoder = new SchemaEncoder(
      "bytes32 MeetingId,uint8 MeetingType,uint32 StartTime,uint32 EndTime"
    );

    console.log(schemaEncoder);

    const encodedData = schemaEncoder.encodeData([
      {
        name: "MeetingId",
        value: bytesToHex(stringToBytes(requestData.meetingId), { size: 32 }),
        type: "bytes32",
      },
      { name: "MeetingType", value: requestData.meetingType, type: "uint8" },
      { name: "StartTime", value: requestData.startTime, type: "uint32" },
      { name: "EndTime", value: requestData.endTime, type: "uint32" },
    ]);

    console.log(encodedData);

    try {
      eas.connect(signer);
      console.log("connected");

      const delegated = await eas.getDelegated();
      console.log(delegated);
      const schemaUID =
        "0x98a9530fb8d7039c36f78e857b55f1c0e2d4caafa00d05dec37f4abef3e301b2";

      console.log("delegated obj: ", delegated);
      const delegatedAttestation = await delegated.signDelegatedAttestation(
        {
          schema: schemaUID,
          recipient: requestData.recipient,
          expirationTime: NO_EXPIRATION,
          revocable: false,
          refUID: ZERO_BYTES32,
          data: encodedData,
          nonce: await eas.getNonce(signer.address),
          value: NO_EXPIRATION,
          deadline: NO_EXPIRATION,
        },
        signer
      );

      console.log("delegatedAttestation: ", delegatedAttestation);
      console.log("verifying...");
      const verify = await delegated.verifyDelegatedAttestationSignature(
        await signer.getAddress(),
        delegatedAttestation
      );
      console.log("verify obj: ", verify);
      return NextResponse.json({ delegatedAttestation }, { status: 200 });
    } catch (error) {
      console.error("Error generating the attestation object: ", error);

      return NextResponse.json(
        { success: false, error: "Error generating the attestation object" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const err = error as MyError;

    console.error("Error:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
