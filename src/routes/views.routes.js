import express from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const router = express.Router();

const renderWithProducts = async (res, view, extra = {}) => {
  try {
    const products = await Product.find();
    res.render(view, { products, ...extra });
  } catch (error) {
    console.error(`Error al cargar productos en /${view}:`, error);
    res.status(500).render("error", { message: "Error al cargar productos" });
  }
};

// Rutas que muestran productos (home, /home, realtimeproducts, dashboard)
router.get(["/", "/home"], (req, res) => renderWithProducts(res, "home"));
router.get("/realtimeproducts", (req, res) => renderWithProducts(res, "realTimeProducts"));
router.get("/dashboard", (req, res) =>
  renderWithProducts(res, "dashboard", { user: { username: "invitado", isAdmin: false } })
);

// Carritos
router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find().populate("products.product");
    res.render("carts", { carts });
  } catch (error) {
    console.error("Error al cargar los carritos:", error);
    res.status(500).render("error", { message: "Error al cargar los carritos." });
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product");
    if (!cart) return res.status(404).render("error", { message: "Carrito no encontrado" });
    res.render("cart", { cart });
  } catch (error) {
    console.error("Error al cargar el carrito:", error);
    res.status(500).render("error", { message: "Error al cargar el carrito" });
  }
});

// Detalle de producto
router.get("/products/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).render("error", { message: "Producto no encontrado" });
    res.render("productDetail", { product });
  } catch (error) {
    console.error("Error al cargar el detalle del producto:", error);
    res.status(500).render("error", { message: "Error al cargar el producto" });
  }
});

export default router;
