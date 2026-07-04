import { NextResponse } from 'next/server'
import { getAvailableRooms } from '@/lib/db/rooms'
import { CheckRoomsSchema, validateRequestSize } from '@/lib/validation'
import { logger } from '@/lib/logger'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const checkIn = searchParams.get('checkIn') ?? ''
  const checkOut = searchParams.get('checkOut') ?? ''

  if (!checkIn || !checkOut) {
    logger.warn('Missing checkIn or checkOut parameters in rooms API request')
    return NextResponse.json(
      { error: 'Missing checkIn or checkOut parameter' },
      { status: 400 }
    )
  }

  if (!validateRequestSize(`${checkIn}${checkOut}`, 100)) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }

  try {
    CheckRoomsSchema.parse({ checkIn, checkOut })
  } catch {
    logger.warn('Invalid date format in rooms API request', { checkIn, checkOut })
    return NextResponse.json(
      { error: 'Invalid date format. Use YYYY-MM-DD' },
      { status: 400 }
    )
  }

  logger.info('Fetching available rooms API', { checkIn, checkOut })
  const rooms = await getAvailableRooms(checkIn, checkOut)
  return NextResponse.json(rooms)
}