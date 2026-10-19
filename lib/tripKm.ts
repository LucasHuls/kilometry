// A separate module (not lib/trips.ts) so it can be imported from client components
// too, without pulling lib/prisma.ts's Prisma client into the browser bundle.
//
// `km` is the outbound route (first stop to last stop). On a return trip the way back
// is `returnKm`, or the same distance again when that's null (single-destination trips).
export function effectiveKm(trip: { km: number; returnKm?: number | null; isReturnTrip: boolean }) {
  if (!trip.isReturnTrip) return trip.km
  return trip.km + (trip.returnKm ?? trip.km)
}
