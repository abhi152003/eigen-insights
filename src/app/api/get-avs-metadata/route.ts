import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch metadata')
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 })
  }
}