import { supabase } from './supabase';

// 1. This helper handles your "Consensus" idea
async function handleConsensus(existing: any, rawIngredients: string) {
  const normalized = rawIngredients.toLowerCase().replace(/\s+/g, '').split(',').sort().join(',');
  
  if (normalized === existing.normalized_hash) {
    const newCount = (existing.verification_count || 1) + 1;
    const newStatus = newCount >= 3 ? 'verified' : 'unverified';
    
    await supabase.from('products')
      .update({ verification_count: newCount, status: newStatus })
      .eq('id', existing.id);
      
    return { ingredients: existing.ingredients, status: newStatus };
  } else {
    // If they don't match, we flag it for you to check manually in Supabase
    await supabase.from('products')
      .update({ status: 'disputed' })
      .eq('id', existing.id);
      
    return { ingredients: existing.ingredients, status: 'disputed' };
  }
}

// 2. This is the main function that runs the "Waterfall"
export async function processProduct(name: string, rawIngredients?: string) {
  const cleanName = name.toLowerCase().trim();

  // STEP A: Check your Supabase first
  const { data: existing } = await supabase.from('products').select('*').eq('name', cleanName).single();
  
  if (existing) {
    if (rawIngredients) return await handleConsensus(existing, rawIngredients);
    return { ingredients: existing.ingredients, status: existing.status };
  }

  // STEP B: Check Open Beauty Facts (The Automation)
  const obfRes = await fetch(`https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${cleanName}&json=1`);
  const obfData = await obfRes.json();

  if (obfData.products?.length > 0 && obfData.products[0].ingredients_text) {
    const ingredients = obfData.products[0].ingredients_text;
    
    // Save to your database so it's instant next time
    await supabase.from('products').insert({
      name: cleanName,
      ingredients: ingredients,
      normalized_hash: ingredients.toLowerCase().replace(/\s+/g, '').split(',').sort().join(','),
      status: 'verified',
      verification_count: 5 // We trust the official DB
    });
    
    return { ingredients, status: 'verified' };
  }

  // STEP C: User must provide ingredients (Your Idea)
  if (rawIngredients) {
    const normalized = rawIngredients.toLowerCase().replace(/\s+/g, '').split(',').sort().join(',');
    await supabase.from('products').insert({
      name: cleanName,
      ingredients: rawIngredients,
      normalized_hash: normalized,
      status: 'unverified',
      verification_count: 1
    });
    return { ingredients: rawIngredients, status: 'unverified' };
  }

  return { error: "Product not found. Please add ingredients." };
}