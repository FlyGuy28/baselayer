import { supabase } from './supabase';

// 1. This helper handles your "Consensus" idea
async function handleConsensus(existing: any, rawIngredients: string) {
  const normalized = rawIngredients.toLowerCase().replace(/\s+/g, '').split(',').sort().join(',');
  
  // Simple ingredient comparison (without normalized_hash since it's not in current schema)
  const existingNormalized = existing.ingredients.toLowerCase().replace(/\s+/g, '').split(',').sort().join(',');
  
  if (normalized === existingNormalized) {
    const newCount = (existing.verification_count || 1) + 1;
    const newStatus = newCount >= 3;
    
    await supabase.from('product_master')
      .update({ verification_count: newCount, is_verified: newStatus })
      .eq('id', existing.id);
      
    return { ingredients: existing.ingredients, is_verified: newStatus };
  } else {
    // If they don't match, we flag it for you to check manually in Supabase
    await supabase.from('product_master')
      .update({ is_verified: false })
      .eq('id', existing.id);
      
    return { ingredients: existing.ingredients, is_verified: false };
  }
}

// 2. This is the main function that runs the "Waterfall"
export async function processProduct(name: string, rawIngredients?: string, barcode?: string) {
  const cleanName = name.toLowerCase().trim();

  // STEP A: Check your Supabase first
  let query = supabase.from('product_master').select('*');
  if (barcode) {
    query = query.eq('barcode', barcode);
  } else {
    query = query.ilike('product_name', `%${cleanName}%`);
  }
  
  const { data: existing } = await query.limit(1).single();
  
  if (existing) {
    if (rawIngredients) return await handleConsensus(existing, rawIngredients);
    return { ingredients: existing.ingredients, is_verified: existing.is_verified };
  }

  // STEP B: Check Open Beauty Facts (The Automation)
  const obfRes = await fetch(`https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${cleanName}&json=1`);
  const obfData = await obfRes.json();

  if (obfData.products?.length > 0 && obfData.products[0].ingredients_text) {
    const ingredients = obfData.products[0].ingredients_text;
    
    // Save to your database so it's instant next time
    await supabase.from('product_master').insert({
      product_name: cleanName,
      ingredients: ingredients,
      barcode: barcode || null,
      is_verified: true,
      verification_count: 5 // We trust the official DB
    });
    
    return { ingredients, is_verified: true };
  }

  // STEP C: User must provide ingredients (Your Idea)
  if (rawIngredients) {
    await supabase.from('product_master').insert({
      product_name: cleanName,
      ingredients: rawIngredients,
      barcode: barcode || null,
      is_verified: false,
      verification_count: 1
    });
    return { ingredients: rawIngredients, is_verified: false };
  }

  return { error: "Product not found. Please add ingredients." };
}