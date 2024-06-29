import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { connectToDB } from '@/config/connectToDB';
import { MongoClient, Db, Collection } from 'mongodb';

interface Result {
  _id: string;
  address: string;
  metadataName: string;
  metadataDescription: string;
  metadataDiscord: string | null;
  metadataLogo: string;
  metadataTelegram: string | null;
  metadataWebsite: string;
  metadataX: string;
  tags: string[];
  shares: any[];
  totalOperators: number;
  totalStakers: number;
  tvl: any;
}

export async function GET(req: NextRequest) {
  console.log('Received request:', req.method, req.nextUrl.search);

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

  const query = req.nextUrl.searchParams.get('q');
  const avsAddress = req.nextUrl.searchParams.get('avsAddress');

  if (!query) {
    console.log('No query parameter');
    return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const client: MongoClient = await connectToDB();
    const db: Db = client.db();
    let collection: Collection<Result>;

    collection = db.collection('avs_operators');

    const regex = new RegExp(query, 'i'); // 'i' for case-insensitive
    const cursor = collection.find({
      $or: [
        { address: regex },
        { metadataName: regex }
      ],
      avs_address: avsAddress 
    });
    const batchedResults = await cursor.toArray();
    const results: Result[] = batchedResults.flatMap(batch => batch);

    // console.log('Search results:', results);

    client.close();
    
    return NextResponse.json(results, {
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