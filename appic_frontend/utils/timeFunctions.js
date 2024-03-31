export function waitWithTimeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("Timeout")), ms);
  });
}
