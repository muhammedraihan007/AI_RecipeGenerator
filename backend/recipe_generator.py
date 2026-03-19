import os
import json
from openai import AsyncOpenAI

# ─────────────────────────────────────────────────────────────────────────────
# FREE AI SETUP — Using Groq's free tier (no credit card required)
#
# 1. Sign up at https://console.groq.com (free)
# 2. Create an API key (Dashboard → API Keys)
# 3. Add it to backend/.env as: GROQ_API_KEY=your-key
#
# Groq is free with generous rate limits and blazing fast inference.
# ─────────────────────────────────────────────────────────────────────────────

client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY", ""),
    base_url="https://api.groq.com/openai/v1",
)

MODEL = "llama-3.3-70b-versatile"


SYSTEM_PROMPT = """You are a world-class chef and culinary expert with deep knowledge of global cuisines.
When given a list of ingredients, you suggest creative, practical recipes that can be made with those ingredients.
You always respond with a valid JSON array of recipe objects. No markdown, no extra text — only pure JSON."""

def build_user_prompt(ingredients: str, cuisine_preference: str) -> str:
    cuisine_note = f" Prefer {cuisine_preference} cuisine if possible." if cuisine_preference.strip() else ""
    return f"""Given these ingredients: {ingredients}{cuisine_note}

Suggest 3 to 5 diverse recipes from different world cuisines.

Respond ONLY with a JSON array. Each recipe object must have exactly these fields:
- "name": string (recipe name)
- "cuisine": string (e.g., "Italian", "Indian", "Mexican")
- "prep_time": string (e.g., "25 minutes")
- "difficulty": string (one of: "Easy", "Medium", "Hard")
- "ingredients": array of strings (full ingredient list including quantities)
- "instructions": array of strings (step-by-step cooking steps)
- "description": string (one appetizing sentence about the dish)

Return ONLY the JSON array. No explanations, no markdown fences."""


async def generate_recipes(ingredients: str, cuisine_preference: str = "") -> list:
    if not os.getenv("GROQ_API_KEY"):
        raise ValueError(
            "GROQ_API_KEY is not set. "
            "Get a free key at https://console.groq.com and add it to backend/.env"
        )

    prompt = build_user_prompt(ingredients, cuisine_preference)

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.85,
        max_tokens=3000,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if the model adds them anyway
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:])
    if raw.endswith("```"):
        raw = raw[:-3].strip()
    raw = raw.strip()

    try:
        recipes = json.loads(raw)
        if not isinstance(recipes, list):
            raise ValueError("Expected a JSON array but got something else")
        return recipes
    except json.JSONDecodeError as e:
        raise ValueError(
            f"The AI returned invalid JSON.\n"
            f"Parse error: {e}\n"
            f"Raw response (first 400 chars): {raw[:400]}"
        )
