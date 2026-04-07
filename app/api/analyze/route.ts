import { createClient } from '@supabase/supabase-js';
import { INGREDIENT_RULES } from '@/lib/ingredientRules';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { product, barcode, ingredients, profile, isManual } = await req.json();
  let rawIngredients = "";
  let finalProductName = product;

  if (isManual && ingredients) {
    // COMMUNITY CONSENSUS LOGIC
    const { data: existing } = await supabase
      .from('product_master')
      .select('*')
      .ilike('product_name', product)
      .single();

    if (existing) {
      if (existing.verification_count < 3) {
        await supabase.from('product_master')
          .update({ 
            verification_count: existing.verification_count + 1,
            barcode: barcode || existing.barcode // update barcode if provided
          })
          .eq('id', existing.id);
      }
      rawIngredients = existing.ingredients;
      finalProductName = existing.product_name;
    } else {
      // First submission
      await supabase.from('product_master').insert([
        { 
          product_name: product || "Unknown Product", 
          barcode: barcode || null,
          ingredients: ingredients, 
          verification_count: 1,
          is_verified: false
        }
      ]);
      rawIngredients = ingredients;
    }
  } else {
    // Normal Search (By Name or Barcode)
    let query = supabase.from('product_master').select('*');
    
    if (barcode) {
      query = query.eq('barcode', barcode);
    } else {
      query = query.ilike('product_name', `%${product}%`);
    }

    const { data, error } = await query.limit(1).single();

    if (error || !data) return Response.json({ status: 'not_found' });
    rawIngredients = data.ingredients;
    finalProductName = data.product_name;
  }

  // SCORING
  let score = 100;
  const warnings = INGREDIENT_RULES.warnings.filter(rule => 
    profile[rule.flag] && rule.keywords.some(k => rawIngredients.toLowerCase().includes(k.toLowerCase()))
  );
  const heroes = INGREDIENT_RULES.heroes.filter(rule => 
    profile[rule.flag] && rule.keywords.some(k => rawIngredients.toLowerCase().includes(k.toLowerCase()))
  );

  score = score - (warnings.length * 15) + (heroes.length * 10);

  return Response.json({
    status: 'success',
    product: finalProductName,
    score: Math.min(Math.max(score, 0), 100),
    warnings,
    heroes
  });
}