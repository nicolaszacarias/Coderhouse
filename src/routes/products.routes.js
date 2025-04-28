
import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";  
import uploader from './uploader.js';

const productsRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsFilePath = path.join(__dirname, "../data/products.json");

const readProducts = () => {
  try {
    const data = fs.readFileSync(productsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeProducts = (products) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Obtener todos los productos
productsRouter.get("/", (req, res) => {
  const products = readProducts();
  res.json(products);
});

// Obtener un producto por ID
productsRouter.get("/:pid", (req, res) => {
  const { pid } = req.params;
  const products = readProducts();
  const product = products.find(p => p.id === pid);

  if (!product) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  res.json(product);
});

// Agregar un producto
productsRouter.post("/", uploader.single("file"), (req, res) => {
  const { title, description, code, price, status, stock, category } = req.body;

  const products = readProducts();

  const newProduct = {
    id: (products.length + 1).toString(),
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
  };

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// Actualizar un producto
productsRouter.put("/:pid", (req, res) => {
  const { pid } = req.params;
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;
  const products = readProducts();
  const productIndex = products.findIndex(p => p.id === pid);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  const updatedProduct = {
    ...products[productIndex],
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  };

  products[productIndex] = updatedProduct;
  writeProducts(products);

  res.json(updatedProduct);
});

// Eliminar un producto
productsRouter.delete("/:pid", (req, res) => {
  const { pid } = req.params;
  const products = readProducts();
  const productIndex = products.findIndex(p => p.id === pid);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }

  products.splice(productIndex, 1);
  writeProducts(products);

  res.status(204).end();
});

export default productsRouter;