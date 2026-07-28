const fmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Kirov",
});

export function formatDate(date: Date) {
  return fmt.format(date);
}
