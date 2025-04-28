import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import ProductManager from './productManager.js';

// Importar routers
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";

// Definir rutas y estructura de directorios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);


const productManager = new ProductManager(path.join(__dirname, "data/products.json"));

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuracion de rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', "handlebars");
app.set('views', path.join(__dirname, "views"));

// Rutas de la aplicación
app.get('/', async (req, res) => {
  try {
    const products = await productManager.getAllProducts();
    res.render('home', { products });
  } catch (error) {
    console.error('Error al cargar productos:', error);
    res.status(500).send('Error al cargar productos');
  }
});

// Ruta secundaria para "/home"
app.get('/home', async (req, res) => {
  try {
    const products = await productManager.getAllProducts();
    res.render('home', { products });
  } catch (error) {
    console.error('Error al cargar productos en /home:', error);
    res.status(500).send('Error al cargar productos');
  }
});

// Ruta para realtimeproducts
app.get('/realtimeproducts', async (req, res) => {
  try {
      const products = await productManager.getAllProducts(); // Obtener todos los productos
      res.render('realTimeProducts', { products }); // Pasar los productos a la vista
  } catch (error) {
      console.error('Error al cargar productos:', error);
      res.status(500).send('Error al cargar productos');
  }
});


// WebSocket para productos en tiempo real
let products = []; 

// Agregar un nuevo producto usando WebSocket
app.post('/add-product', (req, res) => {
  const newProduct = req.body.product;
  products.push(newProduct);

  // Emitir el nuevo producto a todos los clientes conectados
  io.emit('new-product', newProduct);

  res.redirect('/');  
});


app.post('/delete-product', (req, res) => {
  const productToDelete = req.body.product;
  products = products.filter(p => p.id !== productToDelete.id);


  io.emit('delete-product', productToDelete.id);

  res.redirect('/');  
});


io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');


  socket.emit('product-list', products);


  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });


  socket.on("newProduct", async (productData) => {
    try {
        const newProduct = await productManager.createsProduct(productData);
        products.push(newProduct);
        io.emit("productAdded", newProduct);
    } catch (error) {
        console.error("Error al añadir el producto", error);
    }
});

  // Eliminar producto
  socket.on("deleteProduct", async (productId) => {
    try {
      await productManager.deleteProductsById(productId);
      products = products.filter(product => product.id !== productId);
      io.emit("productDeleted", productId);
    } catch (error) {
      console.error("Error al eliminar el producto", error);
    }
  });
});

// Iniciar el servidor
const PORT = 8080;
server.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`);
});