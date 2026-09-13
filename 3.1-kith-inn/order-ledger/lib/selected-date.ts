export function selectedDate(
  current: string,
  today: string,
  dates: string[],
  orders: {date: string}[],
  enteredWithKey: boolean,
): string {
  if (current === today || dates.includes(current)) return current;
  if (!current && enteredWithKey && !orders.some(order => order.date === today)) {
    const occupied = new Set(orders.map(order => order.date));
    return dates.filter(date => occupied.has(date)).sort((a, b) => b.localeCompare(a))[0] ?? today;
  }
  return today;
}
