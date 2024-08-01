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
        const options = { method: 'GET' };

        const avsAddressesRes = (await fetch('https://api.eigenexplorer.com/avs/addresses?take=100', options));
        const avsAddresses = await avsAddressesRes.json();

        const allOperators = [];
        for (const { name, address } of avsAddresses.data) {
            const operatorsRes = await fetch(`https://api.eigenexplorer.com/avs/${address}/operators`, options);
            const operators = await operatorsRes.json();

            const operatorData = {
                name: name || 'Unknown',
                operatorsCount: operators.meta?.total || 0,
            };

            allOperators.push(operatorData);
        }

        return NextResponse.json(allOperators, {
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