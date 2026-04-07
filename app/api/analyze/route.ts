import { createClient } from '@supabase/supabase-js';
import { INGREDIENT_RULES } from '@/lib/ingredientRules';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { product, ingredients: manualIngredients, profile } = await req.json();

  let rawIngredients = "";
  let productName = product || "New Product";

  // 1. Manual/OCR Entry -> Save to Database
  if (manualIngredients) {
    rawIngredients = manualIngredients;
    
    // If they provided a real name, insert it into Supabase!
    if (productName !== "Manual Entry" && productName.trim() !== "") {
      const { error } = await supabase
        .from('product_master')
        .insert([{ product_name: productName, ingredients: rawIngredients }]);
      
      if (error) console.error("Failed to add to DB:", error);
    }
  } else {
    // 2. Standard Database Search
    const { data, error } = await supabase
      .from('product_master')
      .select('*')
      .ilike('product_name', `%${product}%`)
      .limit(1)
      .single();

    if (error || !data) return Response.json({ status: 'not_found', message: 'Not found' });
    rawIngredients = data.ingredients;
    productName = data.product_name;
  }

  // 3. Scoring Logic
  let score = 100;
  const warnings: any[] = [];
  const heroes: any[] = [];

  INGREDIENT_RULES.warnings.forEach(rule => {
    if (profile[rule.flag] && rule.keywords.some(k => rawIngredients.toLowerCase().includes(k.toLowerCase()))) {
      warnings.push(rule);
      score -= 15;
    }
  });

  INGREDIENT_RULES.heroes.forEach(rule => {
    if (profile[rule.flag] && rule.keywords.some(k => rawIngredients.toLowerCase().includes(k.toLowerCase()))) {
      heroes.push(rule);
      score += 10;
    }
  });

  return Response.json({
    status: 'success',
    product: productName,
    score: Math.min(Math.max(score, 0), 100),
    warnings,
    heroes
  });
}