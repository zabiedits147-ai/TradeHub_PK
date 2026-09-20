import axios from 'axios';
import { getProducts } from './productService';
const BASE_URL = 'http://192.168.1.74:5000/api';

export const searchByImage = async (base64Image) => {
  const products = await getProducts();
  const productList = products
    .filter((p) => p.imageUrl)
    .map((p) => ({ id: p._id, imageUrl: p.imageUrl }));

  const response = await axios.post(`${AI_BASE_URL}/visual-search`, {
    image: base64Image,
    products: productList,
  }, { timeout: 20000 });

  // Attach full product data to each match for display
  const matches = response.data.matches.map((match) => {
    const product = products.find((p) => p._id === match.productId);
    return { ...match, product };
  });

  return matches;
};