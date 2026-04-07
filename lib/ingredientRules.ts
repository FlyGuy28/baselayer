export interface IngredientRule {
  name: string;
  flag: string; // This must match the keys in your page.tsx profile state
  keywords: string[];
  detail: string;
}

export const INGREDIENT_RULES = {
  // --- WARNINGS: Ingredients that might harm specific profiles ---
  warnings: [
    // SKIN WARNINGS
    {
      name: "Drying Alcohols",
      flag: "isDry",
      keywords: ["Alcohol Denat", "Isopropyl Alcohol", "SD Alcohol 40", "Ethanol"],
      detail: "These alcohols evaporate quickly and strip moisture, which can worsen dry skin."
    },
    {
      name: "Comedogenic Oils",
      flag: "isOily",
      keywords: ["Cocos Nucifera Oil", "Coconut Oil", "Isopropyl Myristate", "Isopropyl Palmitate", "Myristyl Myristate"],
      detail: "Highly pore-clogging ingredients that can lead to breakouts in oily skin types."
    },
    {
      name: "Synthetic Fragrance",
      flag: "isSensitive",
      keywords: ["Fragrance", "Parfum", "Limonene", "Linalool", "Citral", "Geraniol"],
      detail: "Common irritants that can cause redness or stinging in sensitive skin."
    },
    {
      name: "Malassezia Triggers",
      flag: "isFungalAcne",
      keywords: ["Polysorbate 20", "Polysorbate 80", "Galactomyces", "Lauric Acid", "Stearic Acid", "Palmitic Acid"],
      detail: "Ingredients that feed the yeast responsible for fungal acne."
    },
    {
      name: "Pore-Clogging Waxes",
      flag: "isPoreCongested",
      keywords: ["Ethylhexyl Palmitate", "Isopropyl Palmitate", "Cera Alba", "Beeswax"],
      detail: "Heavy waxes that can sit on the surface and trap debris in already congested pores."
    },
    {
      name: "Potential Irritants",
      flag: "isRosacea",
      keywords: ["Menthol", "Peppermint", "Eucalyptus", "Witch Hazel", "Hamamelis Virginiana"],
      detail: "Cooling or astringent ingredients that can trigger flushing and rosacea flare-ups."
    },

    // HAIR WARNINGS
    {
      name: "Harsh Sulfates",
      flag: "isDamaged",
      keywords: ["Sodium Lauryl Sulfate", "SLS", "Ammonium Lauryl Sulfate", "Sodium Laureth Sulfate"],
      detail: "Aggressive cleansers that can further weaken and strip damaged or chemically treated hair."
    },
    {
      name: "Moisture-Stripping Alcohols",
      flag: "isDryHair",
      keywords: ["Alcohol Denat", "Ethanol", "Propanol"],
      detail: "Can make dry hair more brittle and prone to breakage."
    },
    {
      name: "Heavy Silicones",
      flag: "isThinning",
      keywords: ["Dimethicone", "Amodimethicone", "Dimethiconol"],
      detail: "Can weigh down thin hair, making it appear flat and greasy."
    }
  ] as IngredientRule[],

  // --- HEROES: Ingredients that actively help specific profiles ---
  heroes: [
    // SKIN HEROES
    {
      name: "Deep Hydrators",
      flag: "isDry",
      keywords: ["Hyaluronic Acid", "Glycerin", "Sodium Hyaluronate", "Urea"],
      detail: "Humectants that pull moisture into the skin to relieve dryness."
    },
    {
      name: "Barrier Repair",
      flag: "isDehydrated",
      keywords: ["Ceramide NP", "Ceramide AP", "Ceramide EOP", "Phytosphingosine", "Squalane"],
      detail: "Strengthens your skin's natural shield to prevent moisture loss."
    },
    {
      name: "Calming Agents",
      flag: "isSensitive",
      keywords: ["Centella Asiatica", "Madecassoside", "Allantoin", "Panthenol", "Bisabolol"],
      detail: "Soothing extracts that reduce redness and quiet irritation."
    },
    {
      name: "Blemish Control",
      flag: "isAcneProne",
      keywords: ["Salicylic Acid", "Benzoyl Peroxide", "Niacinamide", "Tea Tree Oil"],
      detail: "Ingredients that fight bacteria and keep pores clear of oil."
    },
    {
      name: "Collagen Boosters",
      flag: "isFineLines",
      keywords: ["Retinol", "Retinyl Palmitate", "Matrixyl", "Copper Tripeptide", "Palmitoyl Pentapeptide"],
      detail: "Anti-aging powerhouses that stimulate cell turnover and smooth fine lines."
    },
    {
      name: "Pore Refiners",
      flag: "isPoreCongested",
      keywords: ["Salicylic Acid", "BHA", "Kaolin", "Bentonite", "Zinc PCA"],
      detail: "Helps dissolve deep-seated oil and tighten the appearance of pores."
    },
    {
      name: "Brightening Actives",
      flag: "isHyperpigmentation",
      keywords: ["Vitamin C", "Ascorbic Acid", "Alpha Arbutin", "Kojic Acid", "Tranexamic Acid", "Licorice Root"],
      detail: "Helps fade dark spots and even out the skin tone."
    },
    {
      name: "Exfoliating Acids",
      flag: "isUnevenTexture",
      keywords: ["Glycolic Acid", "Lactic Acid", "Mandelic Acid", "AHA"],
      detail: "Gently removes dead skin cells to reveal smoother, glowing skin."
    },

    // HAIR HEROES
    {
      name: "Anti-Dandruff Actives",
      flag: "isDandruff",
      keywords: ["Zinc Pyrithione", "Ketoconazole", "Selenium Sulfide", "Piroctone Olamine", "Salicylic Acid"],
      detail: "Proven ingredients that control the flaking and itchiness associated with dandruff."
    },
    {
      name: "Smoothing Agents",
      flag: "isFrizz",
      keywords: ["Argania Spinosa Kernel Oil", "Argan Oil", "Shea Butter", "Dimethicone", "Coconut Oil"],
      detail: "Tames frizz by sealing the hair cuticle and repelling humidity."
    },
    {
      name: "Structural Repair",
      flag: "isDamaged",
      keywords: ["Hydrolyzed Keratin", "Biotin", "Hydrolyzed Wheat Protein", "Bis-Aminopropyl Diglycol Dimaleate"],
      detail: "Helps rebuild the protein bonds in hair that has been damaged by heat or color."
    },
    {
      name: "Scalp Balance",
      flag: "isOilyScalp",
      keywords: ["Salicylic Acid", "Tea Tree Oil", "Nettle Extract", "Peppermint Oil"],
      detail: "Refreshes the scalp and regulates excess sebum production."
    }
  ] as IngredientRule[]
};