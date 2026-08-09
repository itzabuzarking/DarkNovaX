const TAVILY_API_KEY = "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";

async function performWebSearch(query) {
    if (!query || !query.trim()) {
        throw new Error("Search query is empty.");
    }

    const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TAVILY_API_KEY}`
        },
        body: JSON.stringify({
            query: query.trim(),
            topic: "general",
            search_depth: "basic",
            max_results: 8,
            include_answer: false,
            include_raw_content: false
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.detail || data?.error || "Tavily search failed."
        );
    }

    return (data.results || [])
        .filter(result => result.url)
        .map(result => ({
            title: result.title || "Untitled",
            url: result.url,
            content: result.content || ""
        }));
}
