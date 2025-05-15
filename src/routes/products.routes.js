import { Router } from "express";
import multer from "multer";
import Product from "../models/product.model.js";

const productsRouter = Router();

// Configurar multer para imágenes
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "public/img"),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// GET /api/products - Listado con paginación, filtros y orden
productsRouter.get("/", async (req, res) => {
  try {
    // Extraer y validar parámetros
    let { limit = 10, page = 1, query = "", status, sort = "" } = req.query;

    limit = Math.max(parseInt(limit), 1);
    page = Math.max(parseInt(page), 1);

    // Filtros dinámicos
    const filters = {};

    if (query) {
      filters.category = { $regex: query, $options: "i" }; // filtro por categoría parcial
    }

    if (status === "true" || status === "false") {
      filters.status = status === "true";
    }

    const sortOption = {};
    if (sort === "asc" || sort === "desc") {
      sortOption.price = sort === "asc" ? 1 : -1;
    }

    // Paginación
    const result = await Product.paginate(filters, {
      limit,
      page,
      sort: Object.keys(sortOption).length ? sortOption : undefined,
    });

    // Respuesta completa con navegación
    const baseQuery = `limit=${limit}&query=${query}&status=${status}&sort=${sort}`;
    res.json({
      status: "success",
      currentPage: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&${baseQuery}` : null,
      nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&${baseQuery}` : null,
      products: result.docs,
    });
  } catch (err) {
    console.error("❌ Error al obtener productos:", err.message);
    res.status(500).json({ status: "error", message: "Error al obtener productos." });
  }
});


productsRouter.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    res.render("productdetail", { layout: "main", product });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Error al obtener el producto" });
  }
});

// POST /api/products - Crear nuevo producto
productsRouter.post("/", upload.single("thumbnail"), async (req, res) => {
  try {
    const { title, description, code, price, stock, category } = req.body;
    if (![title, description, code, price, stock, category].every(Boolean))
      return res.status(400).json({ message: "Todos los campos son obligatorios" });

    const exists = await Product.findOne({ $or: [{ title }, { code }] });
    if (exists)
      return res.status(409).json({ message: "Título o código duplicado" });

    const newProduct = await Product.create({
      title,
      description,
      code,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      thumbnail: req.file ? `/img/${req.file.filename}` : null,
    });

    req.app.get("io")?.emit("productAdded", newProduct);
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({ message: "Error al crear producto" });
  }
});

// PUT /api/products/:pid - Actualizar producto
productsRouter.put("/:pid", async (req, res) => {
  try {
    const { price, stock } = req.body;

    if (!Object.keys(req.body).length)
      return res.status(400).json({ message: "Debe enviar al menos un campo" });

    if (price && (+price <= 0 || isNaN(price)))
      return res.status(400).json({ message: "Precio inválido" });

    if (stock && (+stock < 0 || isNaN(stock)))
      return res.status(400).json({ message: "Stock inválido" });

    const updated = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!updated)
      return res.status(404).json({ message: "Producto no encontrado" });

    res.json({ status: "success", payload: updated });
  } catch (err) {
    console.error("Error al actualizar producto:", err.message);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
});

// DELETE /api/products/:pid - Eliminar producto
productsRouter.delete("/:pid", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid);
    if (!deleted)
      return res.status(404).json({ message: "Producto no encontrado" });

    req.app.get("io")?.emit("productDeleted", deleted._id.toString());
    res.sendStatus(204);
  } catch (err) {
    console.error("Error al eliminar producto:", err.message);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
});

export default productsRouter;