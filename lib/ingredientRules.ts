export interface Rule {
  name: string;
  keywords: string[];
  flag: string; // Must match your frontend Profile keys (e.g., 'isOily', 'isFungalAcne')
  detail: string;
}

export const INGREDIENT_RULES: { warnings: Rule[]; heroes: Rule[] } = {
  warnings: [
    // Skin Concerns
    { 
      name: 'Fungal Acne Trigger', 
      keywords: ['polysorbate', 'galactomyces', 'saccharomyces', 'isopropyl myristate', 'oleic acid', 'linoleic acid'], 
      flag: 'isFungalAcne', 
      detail: 'Contains lipids, esters, or ferments that can feed Malassezia yeast.' 
    },
    { 
      name: 'Highly Comedogenic', 
      keywords: ['isopropyl myristate', 'coconut oil', 'cocoa butter', 'ethylhexyl palmitate', 'myristyl myristate'], 
      flag: 'isAcneProne', 
      detail: 'Known to be highly pore-clogging and may trigger breakouts.' 
    },
    { 
      name: 'Harsh Alcohol', 
      keywords: ['alcohol denat', 'isopropyl alcohol', 'sd alcohol'], 
      flag: 'isDry', 
      detail: 'Volatile alcohols can strip natural lipids and worsen dry skin.' 
    },
    { 
      name: 'Potential Irritant', 
      keywords: ['fragrance', 'parfum', 'linalool', 'limonene', 'eugenol', 'citronellol', 'geraniol', 'peppermint oil', 'eucalyptus'], 
      flag: 'isSensitive', 
      detail: 'Contains artificial fragrances or essential oils known to irritate sensitive skin.' 
    },
    { 
      name: 'Rosacea Flare Trigger', 
      keywords: ['witch hazel', 'menthol', 'eucalyptus', 'peppermint', 'camphor', 'sodium lauryl sulfate'], 
      flag: 'isRosacea', 
      detail: 'Contains astringents or vasodilators that can exacerbate redness.' 
    },
    
    // Hair & Scalp Concerns
    { 
      name: 'Harsh Sulfate', 
      keywords: ['sodium lauryl sulfate', 'sls', 'ammonium lauryl sulfate'], 
      flag: 'isDryHair', 
      detail: 'Aggressive surfactants that strip moisture from already dry hair.' 
    },
    {
      name: 'Heavy Silicone',
      keywords: ['dimethicone', 'cyclopentasiloxane', 'amodimethicone'],
      flag: 'isOilyScalp',
      detail: 'Non-water-soluble silicones can build up and weigh down hair or trap oil on the scalp.'
    }
  ],
  
  heroes: [
    // Skin Heroes
    { 
      name: 'Deep Hydration', 
      keywords: ['hyaluronic acid', 'sodium hyaluronate', 'glycerin', 'panthenol', 'sodium pca', 'polyglutamic acid'], 
      flag: 'isDehydrated', 
      detail: 'Powerful humectants that bind water to the skin barrier.' 
    },
    { 
      name: 'Barrier Repair', 
      keywords: ['ceramide np', 'ceramide ap', 'ceramide eop', 'cholesterol', 'phytosphingosine'], 
      flag: 'isEczema', 
      detail: 'Replenishes the intercellular lipids crucial for a healthy skin barrier.' 
    },
    { 
      name: 'Soothing & Calming', 
      keywords: ['centella asiatica', 'madecassoside', 'allantoin', 'colloidal oatmeal', 'aloe barbadensis', 'bisabolol'], 
      flag: 'isSensitive', 
      detail: 'Proven ingredients to reduce inflammation and soothe reactive skin.' 
    },
    { 
      name: 'Brightening Power', 
      keywords: ['niacinamide', 'ascorbic acid', 'vitamin c', 'alpha arbutin', 'tranexamic acid', 'licorice root', 'kojic acid'], 
      flag: 'isHyperpigmentation', 
      detail: 'Actives that inhibit melanin production and fade dark spots.' 
    },
    { 
      name: 'Anti-Aging Active', 
      keywords: ['retinol', 'retinaldehyde', 'tretinoin', 'bakuchiol', 'peptides', 'matrixyl', 'copper tripeptide'], 
      flag: 'isAging', 
      detail: 'Stimulates collagen production and increases cellular turnover.' 
    },
    { 
      name: 'Oil Control', 
      keywords: ['salicylic acid', 'bha', 'niacinamide', 'zinc pca', 'kaolin', 'bentonite'], 
      flag: 'isOily', 
      detail: 'Helps regulate sebum production and clear out pores.' 
    },

    // Hair Heroes
    { 
      name: 'Moisture Sealer', 
      keywords: ['argan oil', 'jojoba oil', 'shea butter', 'squalane', 'macadamia seed oil'], 
      flag: 'isCurly', 
      detail: 'Emollients that help seal moisture into the hair cuticle, reducing frizz in textured hair.' 
    },
    { 
      name: 'Growth Support', 
      keywords: ['rosemary leaf extract', 'biotin', 'caffeine', 'peppermint extract', 'saw palmetto'], 
      flag: 'isThinning', 
      detail: 'Stimulates scalp microcirculation to support healthy hair follicles.' 
    }
  ]
};