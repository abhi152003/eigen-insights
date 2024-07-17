import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  console.log("Received request:", req.method);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return NextResponse.next({
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const key = process.env.NEXT_PUBLIC_DUNE_KEY;
    if (!key) {
      throw new Error("DUNE API key not found");
    }

    const options = {
      method: "GET",
      headers: { "X-DUNE-API-KEY": key },
    };

    const duneRes = await fetch(
      "https://api.dune.com/api/v1/eigenlayer/avs-metadata",
      options
    );

    if (!duneRes.ok) {
      throw new Error(`HTTP error! status: ${duneRes.status}`);
    }

    const resJson = await duneRes.json();
    const data = resJson.result.rows;

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}
