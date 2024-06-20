import { DuneClient } from "@duneanalytics/client-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    console.log('Received request:', req.method);
  
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return NextResponse.next({
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }   

    try {
        const dune = new DuneClient("3Ye0oRoE2NSZmqKXWnjhmj8qfw59ITxg");
        const query_result = await dune.getLatestResult({queryId: 3405606});

        return NextResponse.json(query_result, {
            status: 200,
            headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
    }
    
}