import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import connectMongoDB from "./config/db.js";
import viewsRouter from "./routes/views.routes.js";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import Product from "./models/product.model.js";

// Configuración inicial
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Definir rutas y estructura de directorios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a MongoDB
connectMongoDB();

// Configuración de Handlebars
app.engine(
  "handlebars",
  engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    helpers: {
      json: (context) => JSON.stringify(context, null, 2),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Pasar la instancia de io a app para usarla en routers
app.set('io', io);

// Configuración de rutas
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// WebSocket para manejar actualizaciones en tiempo real
let productsCache = [];

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado");

  // Enviar productos actuales al cliente
  try {
    const products = await Product.find();
    productsCache = products; // actualizar cache local
    socket.emit("product-list", productsCache);
  } catch (error) {
    console.error("Error al obtener productos para socket:", error);
  }

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Inicializar productos en el cache al iniciar el servidor (opcional)
(async () => {
  try {
    productsCache = await Product.find();
  } catch (error) {
    console.error("Error al cargar productos en el inicio:", error);
  }
})();

// Iniciar el servidor
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
