export const getDate = () => {
  const date = new Date();
  const month = date.toLocaleString("en-US", { month: "2-digit" });
  const day = date.toLocaleString("en-US", { day: "2-digit" });
  const year = date.toLocaleString("en-US", { year: "numeric" });
  return `${year}-${month}-${day}`;
};

export const displayDate = (date: string | undefined) => {
  if (!date) {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" }).toLowerCase();
    const day = now.getDate();
    return `${month} ${day}`;
  }

  // parse YYYY-MM-DD format directly to avoid timezone issues
  const [year, month, day] = date.split("-").map((n) => parseInt(n));
  const monthName = new Date(year, month - 1).toLocaleString("en-US", {
    month: "short",
  }).toLowerCase();
  return `${monthName} ${day}`;
};
