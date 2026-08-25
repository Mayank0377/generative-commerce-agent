import { loadCatalog } from '../services/catalog.js';
import { createPaymentLink } from '../services/payment.js';

const catalog = loadCatalog();

/**
 * Tool handler implementations that the AI can invoke.
 * Each function corresponds to a tool defined in definitions.js.
 */
const toolHandlers = {
  searchCatalog: ({ query }) => {
    if (!query) return { products: catalog };
    const q = query.toLowerCase();
    const products = catalog.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    return { products };
  },

  generatePaymentLink: async ({ productId }) => {
    const product = catalog.find(p => p.id === productId);
    if (!product) return { error: "Product not found in catalog." };
    if (!product.inStock) return { error: "Product is out of stock." };

    return createPaymentLink(product);
  }
};

export default toolHandlers;
