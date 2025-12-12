"""
Google Custom Search Service for RoleReady
Provides web search functionality for AI Career Coach
"""

import os
import aiohttp
import logging
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GOOGLE_SEARCH_API_KEY = os.getenv("GOOGLE_SEARCH_API_KEY")
GOOGLE_SEARCH_ENGINE_ID = os.getenv("GOOGLE_SEARCH_ENGINE_ID")

SEARCH_API_URL = "https://www.googleapis.com/customsearch/v1"


async def search_web(query: str, num_results: int = 5) -> List[Dict[str, str]]:
    """
    Search the web using Google Custom Search API.
    Returns list of search results with title, snippet, and link.
    """
    if not GOOGLE_SEARCH_API_KEY:
        logger.warning("Google Search API key not configured")
        return []
    
    # Add career-related context to search
    career_query = f"{query} career jobs hiring"
    
    params = {
        "key": GOOGLE_SEARCH_API_KEY,
        "cx": GOOGLE_SEARCH_ENGINE_ID or "000000000000000000000:xxxxxxxx",
        "q": career_query,
        "num": min(num_results, 10),  # Max 10 per request
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(SEARCH_API_URL, params=params) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Search API error: {response.status} - {error_text}")
                    return []
                
                data = await response.json()
                
                results = []
                for item in data.get("items", []):
                    results.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("snippet", ""),
                        "link": item.get("link", ""),
                    })
                
                logger.info(f"Search query '{query}' returned {len(results)} results")
                return results
                
    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        return []


def format_search_results(results: List[Dict[str, str]]) -> str:
    """Format search results for AI context."""
    if not results:
        return ""
    
    formatted = "\n\n## Recent Web Information:\n"
    for i, result in enumerate(results, 1):
        formatted += f"\n{i}. **{result['title']}**\n"
        formatted += f"   {result['snippet']}\n"
        formatted += f"   Source: {result['link']}\n"
    
    return formatted


async def get_career_search_context(query: str) -> str:
    """
    Search for career-related information and return formatted context.
    Used to augment AI responses with latest info.
    """
    # Keywords that suggest user wants current/latest info
    search_triggers = [
        "latest", "current", "2024", "2025", "now", "today",
        "salary", "hiring", "market", "trends", "companies",
        "best", "top", "demand", "skills", "roadmap"
    ]
    
    query_lower = query.lower()
    should_search = any(trigger in query_lower for trigger in search_triggers)
    
    if not should_search:
        return ""
    
    results = await search_web(query, num_results=3)
    return format_search_results(results)
