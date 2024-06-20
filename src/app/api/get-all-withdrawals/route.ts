import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from '@/config/connectToDB';
import { MongoClient, Db, Collection } from 'mongodb';

interface Shares {
    strategyAddress: string;
    shares: string;
}
  
interface WithdrawalData {
    withdrawalRoot: string;
    nonce: number;
    isCompleted: boolean;
    stakerAddress: string;
    delegatedTo: string;
    withdrawerAddress: string;
    shares: Shares[];
    startBlock: number;
    createdAtBlock: number;
    updatedAtBlock: number;
}


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
        const client: MongoClient = await connectToDB();
        const db: Db = client.db();
        let collection: Collection<WithdrawalData>;

        collection = db.collection('withdrawals');

        const completedWithdrawals = await collection.find({"isCompleted": true}).toArray()
        const complete = completedWithdrawals.flatMap(batch => batch).length;

        const queuedWithdrawals = await collection.find({"isCompleted": false}).toArray()
        const queued = queuedWithdrawals.flatMap(batch => batch).length;
        const results = [complete, queued]

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