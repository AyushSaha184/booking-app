import { sendBookingNotifications, sendCancellationNotifications } from '../lib/twilio/notifications'

async function testBooking() {
  console.log('=== Testing Booking Notifications ===')
  const result = await sendBookingNotifications({
    bookingId: 'BK-TEST123',
    guestName: 'John Doe',
    phone: '+1234567890',
    roomName: 'Ocean View Suite',
    roomType: 'Deluxe',
    checkIn: '2026-07-15',
    checkOut: '2026-07-20',
    guests: 2,
    pricePerNight: 150,
    totalNights: 5,
    totalPrice: 750,
  })

  console.log('User SMS:', result.user)
  console.log('Owner SMS:', result.owner)
}

async function testCancellation() {
  console.log('\n=== Testing Cancellation Notifications ===')
  const result = await sendCancellationNotifications({
    bookingId: 'BK-TEST123',
    guestName: 'John Doe',
    phone: '+1234567890',
    roomName: 'Ocean View Suite',
    checkIn: '2026-07-15',
    checkOut: '2026-07-20',
  })

  console.log('User SMS:', result.user)
  console.log('Owner SMS:', result.owner)
}

async function main() {
  await testBooking()
  await testCancellation()
}

main().catch(console.error)