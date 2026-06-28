// Central scheduling configuration. Change these values to adjust opening hours,
// slot length or how many appointments may share the same slot.
export const SCHEDULE = {
  START_HOUR: 9, // first slot starts at 09:00
  END_HOUR: 18, // last slot ends at 18:00 (exclusive → last slot is 17:00)
  SLOT_MINUTES: 60, // each appointment lasts 1 hour
  SLOT_CAPACITY: 3, // how many appointments may share the same time slot
};

// Returns the list of bookable slots, e.g. ["09:00", "10:00", ... "17:00"].
export function generateSlots() {
  const slots = [];
  for (let h = SCHEDULE.START_HOUR; h < SCHEDULE.END_HOUR; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

// True when `time` ("HH:00") is one of the configured slots.
export function isValidSlot(time) {
  return generateSlots().includes(time);
}
