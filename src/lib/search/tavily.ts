const TAVILY_API_URL = "https://api.tavily.com/search"

export interface TavilyResult {
  title: string
  url: string
  content: string
  score: number
  published_date?: string
}

interface TavilyResponse {
  results: TavilyResult[]
  query: string
}

export async function tavilySearch(query: string): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY is not configured. Please set the TAVILY_API_KEY environment variable."
    )
  }

  console.log(`[tavily] Searching: "${query.substring(0, 80)}..."`)

  const res = await fetch(TAVILY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 8,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`[tavily] API error ${res.status}: ${body}`)
    throw new Error(`Tavily search failed with status ${res.status}`)
  }

  const data: TavilyResponse = await res.json()

  console.log(`[tavily] Found ${data.results.length} results`)

  return data.results
}
