import dayjs from "./dayjs";

export const date2humanize = (date: string | Date) => {
  if (!date) return "";
  return dayjs.utc(date).fromNow();
};

export const date2str = (date: string | Date) => {
  if (!date) return "";
  return dayjs.utc(date).format("MMM D, YYYY");
};

export const datetime2str = (date: string | Date) => {
  if (!date) return "";
  return dayjs.utc(date).format("MMM D, YYYY h:mm a");
};

export const getMonthName = (monthNumber: number) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[monthNumber - 1] || "Invalid month";
};
