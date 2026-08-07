// Small date utilities. Kept dependency-free (no moment/dayjs) since the
// needs here are minimal; swap in a library later if requirements grow.

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isPast = (date) => new Date(date).getTime() < Date.now();

const toISODateString = (date) => new Date(date).toISOString().split('T')[0];

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

module.exports = { addMinutes, addDays, isPast, toISODateString, startOfDay, endOfDay };
