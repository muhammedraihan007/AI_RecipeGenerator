// ── Config ────────────────────────────────────────────────
// LOCAL development: keep as http://localhost:8000
// After deploying backend to Railway/Render, replace with your deployed URL:
// e.g. const API_BASE = "https://ai-recipe-maker-api.up.railway.app";
//      const API_BASE = "https://ai-recipe-maker-api.onrender.com";
const API_BASE = "http://localhost:8000";

// ── Loading messages for fun UX ───────────────────────────
const LOADING_MESSAGES = [
  "Consulting the chef...",
  "Exploring world cuisines...",
  "Gathering ingredients from the pantry...",
  "Crafting your perfect recipes...",
  "Almost ready to plate up...",
];

// ── DOM refs ──────────────────────────────────────────────
const ingredientsInput = document.getElementById("ingredients");
const cuisineSelect    = document.getElementById("cuisine");
const generateBtn      = document.getElementById("generate-btn");
const tagsPreview      = document.getElementById("tags-preview");
const loadingSection   = document.getElementById("loading-section");
const loadingMsg       = document.getElementById("loading-msg");
const errorSection     = document.getElementById("error-section");
const errorMsg         = document.getElementById("error-msg");
const resultsSection   = document.getElementById("results-section");
const recipesGrid      = document.getElementById("recipes-grid");

// ── Ingredient tags live preview ──────────────────────────
ingredientsInput.addEventListener("input", updateTagsPreview);

function updateTagsPreview() {
  const raw = ingredientsInput.value;
  const items = raw.split(",").map(s => s.trim()).filter(Boolean);
  tagsPreview.innerHTML = items.map(item =>
    `<span class="tag">🥄 ${escapeHtml(item)}</span>`
  ).join("");
}

// ── Main handler ──────────────────────────────────────────
async function handleGenerate() {
  const ingredients = ingredientsInput.value.trim();
  if (!ingredients) {
    ingredientsInput.focus();
    ingredientsInput.style.borderColor = "var(--terracotta)";
    setTimeout(() => ingredientsInput.style.borderColor = "", 1800);
    return;
  }

  const cuisine = cuisineSelect.value;

  showLoading();
  startLoadingMessages();

  try {
    const response = await fetch(`${API_BASE}/generate-recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients, cuisine_preference: cuisine }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.recipes || !data.recipes.length) {
      throw new Error("No recipes returned. Please try different ingredients.");
    }

    showResults(data.recipes);
  } catch (err) {
    showError(err.message || "Could not connect to the server. Is the backend running?");
  }
}

// ── Keyboard shortcut: Ctrl/Cmd + Enter ──────────────────
ingredientsInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleGenerate();
});

// ── Loading cycling messages ──────────────────────────────
let msgInterval = null;

function startLoadingMessages() {
  let i = 0;
  loadingMsg.textContent = LOADING_MESSAGES[0];
  msgInterval = setInterval(() => {
    i = (i + 1) % LOADING_MESSAGES.length;
    loadingMsg.textContent = LOADING_MESSAGES[i];
  }, 2000);
}

function stopLoadingMessages() {
  clearInterval(msgInterval);
}

// ── UI state helpers ──────────────────────────────────────
function showLoading() {
  generateBtn.disabled = true;
  hide(errorSection);
  hide(resultsSection);
  show(loadingSection);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showError(msg) {
  stopLoadingMessages();
  generateBtn.disabled = false;
  hide(loadingSection);
  hide(resultsSection);
  errorMsg.textContent = msg;
  show(errorSection);
}

function showResults(recipes) {
  stopLoadingMessages();
  generateBtn.disabled = false;
  hide(loadingSection);
  hide(errorSection);
  renderRecipes(recipes);
  show(resultsSection);
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetUI() {
  hide(resultsSection);
  hide(errorSection);
  ingredientsInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

// ── Recipe Rendering ──────────────────────────────────────
function renderRecipes(recipes) {
  recipesGrid.innerHTML = "";
  recipes.forEach((recipe, index) => {
    const card = createRecipeCard(recipe, index);
    recipesGrid.appendChild(card);
  });
}

function createRecipeCard(recipe, index) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.style.animationDelay = `${index * 0.1}s`;

  const ingredientsHtml = (recipe.ingredients || [])
    .map(ing => `<span class="ingredient-item">${escapeHtml(ing)}</span>`)
    .join("");

  const instructionsHtml = (recipe.instructions || [])
    .map((step, i) => `
      <li class="instruction-step">
        <span class="step-num">${i + 1}</span>
        <span class="step-text">${escapeHtml(step)}</span>
      </li>`)
    .join("");

  const difficultyIcon = { Easy: "🟢", Medium: "🟡", Hard: "🔴" }[recipe.difficulty] || "⚪";
  const cardId = `card-${index}`;

  card.innerHTML = `
    <div class="card-header">
      <div class="card-header-left">
        <span class="recipe-cuisine">${escapeHtml(recipe.cuisine || "World")}</span>
        <h3 class="recipe-name">${escapeHtml(recipe.name || "Unnamed Recipe")}</h3>
        <p class="recipe-description">${escapeHtml(recipe.description || "")}</p>
      </div>
      <div class="recipe-meta">
        <span class="meta-pill meta-time">⏱ ${escapeHtml(recipe.prep_time || "—")}</span>
        <span class="meta-pill meta-diff">${difficultyIcon} ${escapeHtml(recipe.difficulty || "—")}</span>
      </div>
    </div>

    <div class="card-body">
      <div class="tabs" role="tablist">
        <button class="tab-btn active" role="tab" aria-selected="true"
          onclick="switchTab(this, '${cardId}-ingredients')">
          Ingredients
        </button>
        <button class="tab-btn" role="tab" aria-selected="false"
          onclick="switchTab(this, '${cardId}-instructions')">
          Instructions
        </button>
      </div>

      <div id="${cardId}-ingredients" class="tab-panel active" role="tabpanel">
        <div class="ingredients-list">${ingredientsHtml}</div>
      </div>

      <div id="${cardId}-instructions" class="tab-panel" role="tabpanel">
        <ol class="instructions-list">${instructionsHtml}</ol>
      </div>
    </div>
  `;

  return card;
}

// ── Tab switching ─────────────────────────────────────────
function switchTab(btn, panelId) {
  const card = btn.closest(".recipe-card");
  card.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-selected", "false");
  });
  card.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");
  document.getElementById(panelId).classList.add("active");
}

// ── XSS safety ───────────────────────────────────────────
function escapeHtml(str) {
  if (typeof str !== "string") str = String(str || "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
