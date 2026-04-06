/**
 * OPEN BEAUTY FACTS - API BRIDGE
 * This file handles the communication with the global OBF database.
 */

const OBF_API_URL = "https://world.openbeautyfacts.org/api/v2/product";
const OBF_WRITE_URL = "https://world.openbeautyfacts.org/cgi/product_jqm2.pl";

/**
 * FETCH: Looks up a product by its barcode.
 */
export async function fetchFromOBF(barcode: string) {
  try {
    const response = await fetch(`${OBF_API_URL}/${barcode}.json`, {
      headers: { 'User-Agent': 'BaseLayerApp - Web - Version 1.0' }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status === 0) return null; // Product not found

    return {
      name: data.product.product_name || "Unknown Product",
      brand: data.product.brands || "Unknown Brand",
      ingredients: data.product.ingredients_text || "",
      image: data.product.image_url || null
    };
  } catch (err) {
    console.error("OBF Fetch Error:", err);
    return null;
  }
}

/**
 * UPLOAD: Sends a new product to the global database.
 * This is triggered when your OCR reads a label that OBF doesn't know yet.
 */
export async function uploadToOBF(barcode: string, productName: string, ingredients: string[]) {
  // These come from your .env.local file
  const username = process.env.OBF_USER;
  const password = process.env.OBF_PASS;

  if (!username || !password) {
    console.warn("⚠️ OBF Credentials missing in .env.local. Upload skipped.");
    return { error: "Credentials missing" };
  }

  const formData = new URLSearchParams();
  formData.append('code', barcode);
  formData.append('product_name', productName);
  formData.append('ingredients_text', ingredients.join(', '));
  formData.append('user_id', username);
  formData.append('password', password);

  try {
    const response = await fetch(OBF_WRITE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    const result = await response.json();
    console.log("🚀 OBF Contribution Success:", result);
    return result;
  } catch (err) {
    console.error("❌ OBF Upload Failed:", err);
    return { error: "Upload failed" };
  }
}