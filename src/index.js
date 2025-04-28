import express from "express";
import ProductManager from "./productManager.js";
import CartManager from "./cartMananger.js";
const server = express();

server.use(express.json())
const productManager = new ProductManager
const cartManager = new CartManager

server.get("/api/products/", async (req, res) => {
    const products = await productManager.getAllProducts();
    res.json({products: products, message: "lista de productos"})
})

server.get("/api/products/:pid", async (req, res) => {
    const pid = parseInt(req.params.pid);
    if (isNaN(pid)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }
    try {
        const product = await productManager.getProductsById(pid);
        res.status(200).json(product);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

server.post("/api/products/", async (req, res) => {
    const newProduct = req.body;
    // validar que ningun producto no tenga estos campos: 
    const requiredFields = ["title", "description", "code", "price", "status", "stock", "category"];
    const missingFields = requiredFields.filter(field => !newProduct.hasOwnProperty(field));
    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Faltan campos obligatorios: ${missingFields.join(", ")}` });
    }
    try {
        const products = await productManager.createProduct(newProduct);
        res.status(201).json({ message: "Producto creado correctamente", products });
    } catch (error) {
        res.status(500).json({ message: "Error al crear el producto", error: error.message });
    }
});


server.put("/api/products/:pid", async (req, res) => {
    const productsId = req.params.pid;
    const updatedData = req.body;
    const products = await productManager.updateProductsById(productsId, updatedData);
    res.json({products: products, message: "Producto actualizado"})
})

server.delete("/api/products/:pid", async (req, res) => {
    const pid = parseInt(req.params.pid); 
    if (isNaN(pid)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }
    try {
        const result = await productManager.deleteProductsById(pid);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


server.post("/api/carts/", async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


server.get("/api/carts/:cid", async (req, res) => {
    const cid = req.params.cid;
    if (isNaN(cid)) {
        return res.status(400).json({ message: "El ID debe ser un número válido" });
    }
    try {
        const carts = await cartManager.getCartById(cid);
        res.status(200).json(carts);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
})


server.post("/api/carts/:cid/products/:pid", async (req, res) => {
    const cid = req.params.cid
    const pid = req.params.pid
    const quantity = req.body.quantity
    const carts = await cartManager.addProductToCart(cid, pid, quantity)
    res.status(200).json({carts, message: "Nuevo producto añadido"})
})

server.listen(8080, ()=> {
    console.log("Servidor iniciado correctamente")
})