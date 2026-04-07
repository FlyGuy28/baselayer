import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { INGREDIENT_RULES } from '@/lib/ingredientRules';

console.log("DEBUG ENV:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "URL EXISTS" : "URL MISSING");

// Initialize Supabase admin client
// Using the service role key to bypass RLS policies for simple server-side data reading
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product, profile, manualIngredients } = body;

    let ingredientsText = "";
    let productName = product;

    // -------------------------------------------------------------
    // STEP 1: Fetch Ingredients (From manual input OR database)
    // -------------------------------------------------------------
    if (manualIngredients && manualIngredients.length > 0) {
      // User scanned an OCR label or pasted ingredients manually
      ingredientsText = manualIngredients.join(', ').toLowerCase();
      productName = product || "Scanned Product";
    } else {
      // Search the database using either a Barcode (exact match) or Product Name (fuzzy match)
      const { data, error } = await supabase
        .from('product_master')
        .select('ingredients_text, product_name')
        .or(`barcode.eq.${product},product_name.ilike.%${product}%`)
        .limit(1)
        .single();

      // If nothing is found, tell the frontend to show the "Not Found / Manual Text" UI
      if (error || !data) {
        return NextResponse.json({ status: 'missing', product: productName });
      }

      ingredientsText = data.ingredients_text.toLowerCase();
      productName = data.product_name;
    }

    // -------------------------------------------------------------
    // STEP 2: Ingredient Intelligence Analysis
    // -------------------------------------------------------------
    const foundWarnings: { name: string; detail: string }[] = [];
    const foundHeroes: { name: string; detail: string }[] = [];

    // Analyze Warnings against User Profile
    INGREDIENT_RULES.warnings.forEach(rule => {
      // Only check if the user actually has this concern/flag checked in their profile
      if (profile[rule.flag]) {
        // Check if any of the rule's keywords exist in the ingredient list
        const matched = rule.keywords.some(keyword => ingredientsText.includes(keyword.toLowerCase()));
        if (matched) {
          foundWarnings.push({ name: rule.name, detail: rule.detail });
        }
      }
    });

    // Analyze Heroes against User Profile
    INGREDIENT_RULES.heroes.forEach(rule => {
      if (profile[rule.flag]) {
        const matched = rule.keywords.some(keyword => ingredientsText.includes(keyword.toLowerCase()));
        if (matched) {
          foundHeroes.push({ name: rule.name, detail: rule.detail });
        }
      }
    });

    // -------------------------------------------------------------
    // STEP 3: Calculate Compatibility Score
    // -------------------------------------------------------------
    let score = 80; // Baseline score for a completely neutral product
    
    // Penalize heavily for warnings (they are active threats to the user's specific skin type)
    score -= (foundWarnings.length * 15);
    
    // Reward for heroes (they actively help the user's specific goals)
    score += (foundHeroes.length * 8);
    
    // Clamp the score so it never drops below 0 or goes above 100
    score = Math.max(0, Math.min(100, score));

    // -------------------------------------------------------------
    // STEP 4: Return formatted response to Frontend
    // -------------------------------------------------------------
    return NextResponse.json({
      status: 'success',
      product: productName,
      score,
      warnings: foundWarnings,
      heroes: foundHeroes
    });

  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}