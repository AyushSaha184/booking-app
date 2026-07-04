import { z } from 'zod';

const PHONE_REGEX = /^\+?[\d\s\-]{10,15}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const CreateBookingSchema = z.object({
  guestName: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: z.string().min(10, 'Invalid phone number').max(15, 'Invalid phone number').regex(PHONE_REGEX, 'Invalid phone format'),
  roomId: z.string().min(1, 'Room selection required'),
  checkIn: z.string().regex(DATE_REGEX, 'Invalid date format').refine(date => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, 'Check-in date cannot be in the past'),
  checkOut: z.string().regex(DATE_REGEX, 'Invalid date format'),
  guests: z.number().int().min(1, 'At least 1 guest').max(20, 'Too many guests'),
}).refine(data => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});
