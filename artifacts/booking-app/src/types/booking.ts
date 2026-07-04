export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  description?: string | null;
  images?: string[] | null;
}

export interface BookingFormData {
  guestName: string;
  phone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface BookingPrefill {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}
