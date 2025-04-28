import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";  

const cartsRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cartsFilePath = path.join(__dirname, "../data/carts.json");
const productsFilePath = path.join(__dirname, "../data/products.json");

// Función para leer los productos 
const readProducts = () => {
  try {
    const data = fs.readFileSync(productsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Función para leer los carritos
const readCarts = () => {
  try {
    const data = fs.readFileSync(cartsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeCarts = (carts) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};

// Crear un nuevo carrito
cartsRouter.post("/", (req, res) => {
  const carts = readCarts();
  const newCart = {
    id: (carts.length + 1).toString(),
    products: [],
  };
  carts.push(newCart);
  writeCarts(carts);

  res.status(201).json(newCart);
});

// Obtener los productos de un carrito
cartsRouter.get("/:cid", (req, res) => {
  const { cid } = req.params;
  const carts = readCarts();
  const cart = carts.find(c => c.id === cid);

  if (!cart) {
    return res.status(404).json({ message: "Carrito no encontrado" });
  }

  res.json(cart.products);
});

// Agregar un producto al carrito
cartsRouter.post("/:cid/product/:pid", (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body; 
  const carts = readCarts();
  const products = readProducts(); 
  const cart = carts.find(c => c.id === cid);
  const product = products.find(p => p.id === pid);

  if (!cart || !product) {
    return res.status(404).json({ message: "Carrito o Producto no encontrado" });
  }

  // Verificar si el producto ya está en el carrito
  const existingProduct = cart.products.find(p => p.product === pid);
  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.products.push({ product: pid, quantity });
  }

  writeCarts(carts);

  res.json(cart);
});

export default cartsRouter;