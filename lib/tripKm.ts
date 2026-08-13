// A separate module (not lib/trips.ts) so it can be imported from client components
// too, without pulling lib/prisma.ts's Prisma client into the browser bundle.
export function effectiveKm(trip: { km: number; isReturnTrip: boolean }) {
  return trip.isReturnTrip ? trip.km * 2 : trip.km
}
