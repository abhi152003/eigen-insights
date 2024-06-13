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
  
    const query = req.nextUrl.searchParams.get('query');
  
    if (!query) {
      console.log('No query parameter');
      return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
    }
  
    try {
      const client: MongoClient = await connectToDB();
      const db: Db = client.db();
      let collection: Collection<Result>;
  
      const skip = req.nextUrl.searchParams.get('skip');
      const limit = req.nextUrl.searchParams.get('limit');
      const skipNumber = parseInt(skip as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      if (query === 'operators') {
        collection = db.collection('operators');
      } else if (query === 'avss') {
        collection = db.collection('avss');
      } else {
        return NextResponse.json({ message: 'Invalid prop value' }, { status: 400 });
      }
  
      const batchedResults = await collection.find({}).sort({ totalStakers: -1 }).skip(skipNumber).limit(limitNumber).toArray();
      const results: Result[] = batchedResults.flatMap(batch => batch);
  
      console.log('Search results:', results);
  
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