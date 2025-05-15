import { Router } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const cartsRouter = Router();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Crear un nuevo carrito vacío
cartsRouter.post("/", async (_, res) => {
  try {
    const cart = await Cart.create({});
    res.status(201).json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Obtener productos de un carrito
cartsRouter.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!isValidObjectId(cid))
    return res.status(400).json({ status: "error", message: "ID de carrito inválido" });

  try {
    const cart = await Cart.findById(cid).populate("products.product");
    if (!cart)
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Agregar producto al carrito
cartsRouter.post("/:cid/product/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity = 1 } = req.body;

  if (!isValidObjectId(cid) || !isValidObjectId(pid))
    return res.status(400).json({ status: "error", message: "ID inválido" });

  try {
    const [product, cart] = await Promise.all([
      Product.findById(pid),
      Cart.findById(cid)
    ]);

    if (!product || !cart)
      return res.status(404).json({ status: "error", message: "Producto o carrito no encontrado" });

    const item = cart.products.find(p => p.product.toString() === pid);
    item ? item.quantity += quantity : cart.products.push({ product: pid, quantity });

    await cart.save();
    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Actualizar cantidad de un producto del carrito
cartsRouter.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  if (!isValidObjectId(cid) || !isValidObjectId(pid) || !Number.isInteger(quantity))
    return res.status(400).json({ status: "error", message: "ID o cantidad inválidos" });

  try {
    const cart = await Cart.findById(cid);
    if (!cart)
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item)
      return res.status(404).json({ status: "error", message: "Producto no encontrado en el carrito" });

    item.quantity += quantity;
    if (item.quantity < 1)
      return res.status(400).json({ status: "error", message: "Cantidad inválida" });

    await cart.save();
    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Eliminar producto del carrito
cartsRouter.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;

  if (!isValidObjectId(cid) || !isValidObjectId(pid))
    return res.status(400).json({ status: "error", message: "ID inválido" });

  try {
    const cart = await Cart.findById(cid);
    if (!cart)
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Eliminar carrito completo
cartsRouter.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!isValidObjectId(cid))
    return res.status(400).json({ status: "error", message: "ID de carrito inválido" });

  try {
    const deleted = await Cart.findByIdAndDelete(cid);
    if (!deleted)
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    res.json({ status: "success", message: "Carrito eliminado con éxito" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});



export default cartsRouter;
