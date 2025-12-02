export const isUrlOrPath = (value) => {
  if (!value) {
    return true;
  }
  try {
    new URL(value);
    return true;
  } catch (e) {
    if (value.startsWith("/") && !value.includes(" ") && value.length > 1) {
      return true;
    }
  }
  return false;
};
