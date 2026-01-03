export const CATEGORY_IMAGES: Record<string, string> = {
    "Lanches": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=800",
    "Bebidas": "https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=800",
    "Porções": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=800",
    "Combos": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
    "Sobremesas": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800"
};

export const getPlaceholderImage = (category: string, productName?: string): string => {
    // If we have a specific product name, we could theoretically try to search, 
    // but for stability we return the category curated image.
    return CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Lanches"];
};
