export const CATEGORY_IMAGES: Record<string, string> = {
    "Lanches": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=800", // Burger
    "Bebidas": "https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=800", // Drinks
    "Porções": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=800", // Fries/Snacks
    "Combos": "https://images.unsplash.com/photo-1626082896492-766af4eb6501?auto=format&fit=crop&q=80&w=800",  // Burger + Fries Combo
    "Sobremesas": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800", // Dessert
    "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800"      // Pizza
};

export const getPlaceholderImage = (category: string, productName: string = ''): string => {
    const name = productName.toLowerCase();

    // Keyword detection for better accuracy
    if (name.includes('pizza')) return CATEGORY_IMAGES["Pizza"];
    if (name.includes('burger') || name.includes(' x-') || name.startsWith('x-')) return CATEGORY_IMAGES["Lanches"];
    if (name.includes('suco') || name.includes('refrigerante') || name.includes('coca') || name.includes('cerveja')) return CATEGORY_IMAGES["Bebidas"];
    if (name.includes('batata') || name.includes('frita') || name.includes('nugget')) return CATEGORY_IMAGES["Porções"];
    if (name.includes('doce') || name.includes('bolo') || name.includes('açaí') || name.includes('acai')) return CATEGORY_IMAGES["Sobremesas"];

    return CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Lanches"];
};
