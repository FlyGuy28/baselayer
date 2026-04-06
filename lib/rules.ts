import cosingData from '../data/cosing_master.json';

export const ingredientRules = [
  // --- INDIVIDUAL CERAMIDES (Barrier Builders) ---
  { name: "Ceramide NP", type: "any", text: "Barrier Builder (NP)", desc: "Essential for healthy, resilient skin.", category: "good" },
  { name: "Ceramide AP", type: "any", text: "Barrier Builder (AP)", desc: "Helps with skin renewal and smoothing.", category: "good" },
  { name: "Ceramide EOP", type: "any", text: "Barrier Builder (EOP)", desc: "Strengthens the long-term moisture barrier.", category: "good" },

  // --- FUNGAL ACNE TRIGGERS (The "CeraVe" Killers) ---
  { name: "Polysorbate", type: "isFungalAcne", text: "Fungal Acne Trigger", desc: "Common emulsifier that feeds Malassezia yeast.", category: "bad" },
  { name: "Ceteareth-20", type: "isFungalAcne", text: "FA Trigger Combo", desc: "When mixed with fatty alcohols, it triggers fungal breakouts.", category: "bad" },
  { name: "Stearic Acid", type: "isFungalAcne", text: "Fatty Acid", desc: "A lipid that can feed fungal acne yeast.", category: "bad" },
  { name: "Isopropyl Palmitate", type: "isFungalAcne", text: "Esters", desc: "Highly comedogenic and fungal acne unsafe.", category: "bad" },
  { name: "Galactomyces", type: "isFungalAcne", text: "Fermented Trigger", desc: "Fermented ingredients can worsen fungal acne.", category: "bad" },
  { name: "Coconut Oil", type: "isFungalAcne", text: "Heavy Lipid", desc: "High in Lauric acid; strictly avoid with Fungal Acne.", category: "bad" },

  // --- SKINCARE HEROES & WARNINGS ---
  { name: "Retinol", type: "any", text: "Vitamin A", desc: "Anti-aging powerhouse.", category: "good", usageTip: "Night use only. Always use SPF." },
  { name: "Vitamin C", type: "any", text: "Antioxidant", desc: "Brightens skin.", category: "good", usageTip: "Best in the morning under sunscreen." },
  { name: "Niacinamide", type: "any", text: "Barrier Repair", desc: "Refines pores and balances oil.", category: "good" },
  { name: "Hyaluronic Acid", type: "any", text: "Hydration Hero", desc: "Holds 1000x its weight in water.", category: "good" },
  { name: "Salicylic Acid", type: "isAcneProne", text: "BHA Exfoliant", desc: "Clears deep into pores.", category: "bad", usageTip: "Can be drying; don't over-use." },
  { name: "Alcohol Denat", type: "isDehydrated", text: "Drying Alcohol", desc: "Strips the moisture barrier.", category: "bad", usageTip: "Follow with a thick moisturizer." },

  // --- HAIR TEXTURE & GROWTH ---
  { name: "Minoxidil", type: "any", text: "Growth Active", desc: "FDA-approved for hair regrowth.", category: "good" },
  { name: "Saw Palmetto", type: "isThinning", text: "DHT Blocker", desc: "Helps reduce hair loss.", category: "good" },
  { name: "Caffeine", type: "isThinning", text: "Follicle Stimulant", desc: "Energizes the scalp to support growth.", category: "good" },
  { name: "Rice Protein", type: "isFine", text: "Volumizer", desc: "Adds diameter to hair strands.", category: "good" },
  { name: "Shea Butter", type: "isStraight", text: "Heavy Lipid", desc: "Too heavy for straight hair.", category: "bad" },
  { name: "Behentrimonium Chloride", type: "isCoily", text: "Detangling Agent", desc: "Provides slip for coily textures.", category: "good" },
  { name: "Isopropyl Alcohol", type: "isThinning", text: "Brittle Warning", desc: "Makes thinning hair brittle.", category: "bad" },
  { name: "Sodium Lauryl Sulfate", type: "isCurly", text: "Harsh Sulfate (SLS)", desc: "Strips oils; causes severe frizz in curly hair.", category: "bad" },
  { name: "Dimethicone", type: "isThinning", text: "Heavy Silicone", desc: "Weighs down thin hair.", category: "bad" },
  { name: "Biotin", type: "isThinning", text: "Strengthener", desc: "Helps prevent hair breakage.", category: "good" }
];

export function getIngredientFunction(name: string) {
  if (!cosingData) return "Cosmetic Ingredient";
  const match = (cosingData as Array<{name: string, func: string}>).find(i => 
    i.name.toLowerCase() === name.toLowerCase()
  );
  return match ? match.func : "Standard Cosmetic Ingredient";
}

export function translateCosIng(ingredientName: string, cosingFunction: string, userProfile: any) {
  if (cosingFunction.includes("Antistatic") && userProfile.isFine) return "Helps stop frizz but can make fine hair flat.";
  if (cosingFunction.includes("Surfactant") && userProfile.isSensitive) return "A cleanser; rinse well to avoid irritation.";
  if (cosingFunction.includes("Emollient") && userProfile.isDehydrated) return "Locks in moisture! Perfect for dehydration.";
  if (cosingFunction.includes("Hair conditioning") && userProfile.isThinning) return "Conditions hair, but check if it feels too heavy.";
  if (cosingFunction.includes("Antidandruff") && userProfile.isFungalAcne) return "Great! This active helps fight fungal breakouts.";
  return `Official Function: ${cosingFunction}`;
}

export function checkRoutineConflicts(am: any[], pm: any[]) {
  const issues: string[] = [];
  if (am.some(p => p.heroes?.some((h: any) => h.name === 'Retinol'))) {
    issues.push("Retinol in AM detected. Move to PM to avoid sun damage.");
  }
  const hasVitC = (list: any[]) => list.some(p => p.heroes?.some((h: any) => h.name === 'Vitamin C'));
  const hasRetinol = (list: any[]) => list.some(p => p.heroes?.some((h: any) => h.name === 'Retinol'));
  if ((hasVitC(am) && hasRetinol(am)) || (hasVitC(pm) && hasRetinol(pm))) {
    issues.push("Conflict: Don't mix Vit C and Retinol together. Split AM/PM.");
  }
  return issues;
}

export function evaluateIngredients(ingredients: string[], userProfile: any) {
  let score = 100;
  const warnings: any[] = [];
  const heroes: any[] = [];
  const lowerIngredients = ingredients.map(i => i.toLowerCase().trim());

  lowerIngredients.forEach(ing => {
    let matchedRule = false;
    
    ingredientRules.forEach(rule => {
      if (ing.includes(rule.name.toLowerCase())) {
        matchedRule = true;
        const result = { name: rule.name, title: rule.text, detail: rule.desc, tip: rule.usageTip, category: rule.category };
        
        // Respect the user's profile settings
        const isMatch = rule.type === 'any' || userProfile[rule.type] === true;
        
        if (isMatch) {
          if (rule.category === "bad") {
            warnings.push(result);
            score -= 15;
          } else if (rule.category === "good") {
            heroes.push(result);
            score += 2;
          }
        }
      }
    });

    if (!matchedRule && ing.length > 3) {
       const officialFunc = getIngredientFunction(ing);
       if (officialFunc !== "Standard Cosmetic Ingredient") {
          heroes.push({ 
            name: ing, 
            title: "Dictionary Match", 
            detail: translateCosIng(ing, officialFunc, userProfile), 
            category: "neutral" 
          });
       }
    }
  });

  return { 
    score: Math.min(100, Math.max(0, score)), 
    warnings, 
    heroes,
    ingredients: lowerIngredients 
  };
}

// --- ROUTINE ORDERING ENGINE (SKIN, HAIR, HYGIENE) ---

export const APPLY_ORDER: Record<string, number> = {
  // Skin Section
  CLEANSER: 1, TONER: 2, SERUM: 3, MOISTURIZER: 4, SPF: 5,
  // Hair Section
  SHAMPOO: 21, CONDITIONER: 22, LEAVE_IN: 23, SCALP_TREATMENT: 24,
  // Hygiene/Body Section
  BODY_WASH: 41, DEODORANT: 42, BODY_LOTION: 43,
  UNKNOWN: 100
};

export function getProductCategory(ingredients: string[], productName: string) {
  const name = productName.toLowerCase();
  const ings = (ingredients || []).map(i => i.toLowerCase());

  // 1. HAIR LOGIC
  if (name.includes("shampoo")) return "SHAMPOO";
  if (name.includes("conditioner")) return "CONDITIONER";
  if (name.includes("leave-in") || name.includes("hair mask")) return "LEAVE_IN";
  if (name.includes("scalp") || ings.includes("minoxidil")) return "SCALP_TREATMENT";

  // 2. HYGIENE / BODY LOGIC
  if (name.includes("body wash") || name.includes("shower gel")) return "BODY_WASH";
  if (name.includes("deodorant") || name.includes("antiperspirant")) return "DEODORANT";
  if (name.includes("body lotion") || name.includes("body cream")) return "BODY_LOTION";

  // 3. SKIN LOGIC (Default Fallback)
  if (name.includes("wash") || name.includes("cleanser") || ings.includes("sodium laureth sulfate")) return "CLEANSER";
  if (name.includes("toner") || name.includes("essence")) return "TONER";
  if (name.includes("serum") || name.includes("ampoule")) return "SERUM";
  if (name.includes("spf") || name.includes("sunscreen") || ings.includes("zinc oxide")) return "SPF";

  return "MOISTURIZER"; 
}

export function sortRoutine(products: any[]) {
  return [...products].sort((a, b) => {
    const catA = getProductCategory(a.ingredients, a.product);
    const catB = getProductCategory(b.ingredients, b.product);
    return (APPLY_ORDER[catA] || 100) - (APPLY_ORDER[catB] || 100);
  });
}