"""
Common utilities for Gemini AI Services
Shared helper functions and configuration
"""

import os
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai
from typing import Optional, Dict, List, Any

# Load .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
logger.info(f"GEMINI_API_KEY present: {bool(GEMINI_API_KEY)}")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Gemini API configured successfully")
else:
    logger.warning("GEMINI_API_KEY not found in environment variables!")

# Model configuration
MODEL_NAME = "gemini-2.5-flash"


def get_model():
    """Get configured Gemini model"""
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY is not set. Please add it to your .env file.")
    return genai.GenerativeModel(MODEL_NAME)


def clean_json_response(text: str) -> str:
    """Clean markdown code blocks and extract only JSON from response"""
    # Remove markdown code blocks
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    
    # Find the start of JSON (either { for object or [ for array)
    first_brace = text.find('{')
    first_bracket = text.find('[')
    
    # Determine if it's an array or object based on which comes first
    if first_bracket != -1 and (first_brace == -1 or first_bracket < first_brace):
        # It's an array
        last_bracket = text.rfind(']')
        if last_bracket > first_bracket:
            text = text[first_bracket:last_bracket + 1]
    elif first_brace != -1:
        # It's an object
        last_brace = text.rfind('}')
        if last_brace > first_brace:
            text = text[first_brace:last_brace + 1]
    
    return text.strip()
