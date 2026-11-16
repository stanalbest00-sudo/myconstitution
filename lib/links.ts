/** Questions travel in the URL fragment, which browsers never send to servers or put in access logs. */
export function askHref(q: string): string {
  return `/ask#q=${encodeURIComponent(q)}`;
}
