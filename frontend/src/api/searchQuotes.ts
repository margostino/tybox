import { Quote } from "../models";

export async function searchQuotes(query: string): Promise<Array<Quote>> {
  const apiBaseUrl = process.env.API_BASE_URL;
  console.log(`SEARCHING QUOTES FOR ${query} on ${apiBaseUrl}`);
  const response = await fetch(`${apiBaseUrl}/v1/quotes/search?q=${query}`);
  console.log(`RESPONSE: ${response}`);
  const data: Array<Quote> = await response.json();
  return data;
}
