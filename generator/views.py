from django.shortcuts import render
from django.http import JsonResponse
from google import genai
import os
import re

def index(request):
    return render(request, 'generator/index.html')

def parse_recipe(text):
    """Parses the AI-generated text to extract recipe details."""
    try:
        recipe_name_match = re.search(r"Recipe Name:\s*(.*)", text, re.IGNORECASE)
        ingredients_match = re.search(r"Ingredients:\s*([\s\S]*?)(?=Instructions:|$)", text, re.IGNORECASE)
        instructions_match = re.search(r"Instructions:\s*([\s\S]*?)(?=Nutritional Info:|$)", text, re.IGNORECASE)
        nutritional_info_match = re.search(r"Nutritional Info:\s*(.*)", text, re.IGNORECASE)

        recipe_name = recipe_name_match.group(1).strip() if recipe_name_match else "Generated Recipe"
        
        ingredients_text = ingredients_match.group(1).strip() if ingredients_match else ""
        ingredients = [ing.strip() for ing in ingredients_text.split('\n') if ing.strip()]

        instructions = instructions_match.group(1).strip() if instructions_match else "No instructions provided."
        nutritional_info = nutritional_info_match.group(1).strip() if nutritional_info_match else "Not provided."

        return {
            'recipe_name': recipe_name,
            'ingredients': ingredients,
            'instructions': instructions,
            'nutritional_info': nutritional_info,
        }
    except Exception as e:
        # If parsing fails, return the raw text so the user can at least see the output
        return {
            'recipe_name': "Could Not Parse Recipe",
            'ingredients': [],
            'instructions': text,
            'nutritional_info': f"Error parsing recipe: {e}",
        }

def generate_recipe(request):
    if request.method == 'POST':
        ingredients = request.POST.get('ingredients')
        diet = request.POST.get('diet')

        if not ingredients:
            return JsonResponse({'error': 'Please enter at least one ingredient.'}, status=400)

        try:
            # IMPORTANT: It is highly recommended to move the API key to a more secure location,
            # for example by setting the GEMINI_API_KEY environment variable.
            os.environ['GEMINI_API_KEY'] = 'AIzaSyDUpNb6GHtpaMiy0cRiRhCvzzbZPCQ9c4Q'
            client = genai.Client()

            prompt = (
                f"You are a creative chef. Create a recipe using the following ingredients: {ingredients}. "
                f"The recipe must be {diet}. "
                "Please structure your response with the following headings clearly separated by new lines:\n"
                "Recipe Name:\n"
                "Ingredients:\n"
                "Instructions:\n"
                "Nutritional Info:\n"
            )

            response = client.models.generate_content(
                model='models/gemini-flash-latest',
                contents=prompt
            )
            
            # Parse the text response to create a structured dictionary
            # The actual text is in response.candidates[0].content.parts[0].text
            response_data = parse_recipe(response.candidates[0].content.parts[0].text)
            response_data['prompt_used'] = prompt # For debugging

            return JsonResponse(response_data)

        except Exception as e:
            # Catch potential API errors or other issues
            return JsonResponse({'error': f'An error occurred while generating the recipe: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)