from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from recipe_generator import generate_recipes
import uvicorn
from dotenv import load_dotenv

load_dotenv()  # Load .env file automatically

app = FastAPI(title="AI Recipe Maker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecipeRequest(BaseModel):
    ingredients: str
    cuisine_preference: str = ""


@app.get("/")
def root():
    return {"status": "AI Recipe Maker API is running 🍳"}


@app.post("/generate-recipes")
async def generate_recipes_endpoint(request: RecipeRequest):
    if not request.ingredients.strip():
        raise HTTPException(status_code=400, detail="Please provide at least one ingredient.")

    try:
        recipes = await generate_recipes(request.ingredients, request.cuisine_preference)
        return {"recipes": recipes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
