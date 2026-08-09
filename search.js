export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const query = String(req.query.q || "").trim();

    if (!query) {
        return res.status(400).json({
            error: "Search query is required"
        });
    }

    if (query.length > 400) {
        return res.status(400).json({
            error: "Search query is too long"
        });
    }

    const apiKey = process.env.BRAVE_SEARCH_API_KEY;

    if (!apiKey) {
        console.error("BRAVE_SEARCH_API_KEY is not configured");

        return res.status(500).json({
            error: "Web search is not configured on the server."
        });
    }

    try {
        const url = new URL(
            "https://api.search.brave.com/res/v1/web/search"
        );

        url.searchParams.set("q", query);
        url.searchParams.set("count", "8");
        url.searchParams.set("country", "PK");
        url.searchParams.set("search_lang", "en");
        url.searchParams.set("safesearch", "moderate");
        url.searchParams.set("extra_snippets", "true");

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "X-Subscription-Token": apiKey
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Brave Search error:", data);

            return res.status(response.status).json({
                error: "Search provider error"
            });
        }

        const results = (data.web?.results || [])
            .slice(0, 8)
            .map(result => ({
                title: result.title || "Untitled",
                url: result.url || "",
                description: result.description || "",
                extraSnippets: Array.isArray(result.extra_snippets)
                    ? result.extra_snippets.slice(0, 2)
                    : []
            }))
            .filter(result => result.url);

        return res.status(200).json({
            query,
            results,
            moreResultsAvailable:
                data.query?.more_results_available === true
        });

    } catch (error) {
        console.error("Search request failed:", error);

        return res.status(500).json({
            error: "Web search failed."
        });
    }
}
