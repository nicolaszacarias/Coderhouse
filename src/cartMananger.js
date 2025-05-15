import fs from 'fs';

class CartManager {
  constructor(path = './src/data/carts.json') {
    this.path = path;
  }

  async getCarts() {
    const data = await fs.promises.readFile(this.path, 'utf-8');
    return JSON.parse(data);
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(cart => cart.id === id);
  }

  async createCart() {
    const carts = await this.getCarts();
    const newCart = {
      id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
      products: []
    };
    carts.push(newCart);
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async addProductToCart(cartId, productId) {
    const carts = await this.getCarts();
    const cart = carts.find(c => c.id === cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    const productIndex = cart.products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity++;
    } else {
      cart.products.push({ id: productId, quantity: 1 });
    }

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }
}

export default CartManager;