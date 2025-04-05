import fs from "fs";

class CartManager {
    constructor(){
        this.path = "./carts.json";
    }

    generateId = (carts) => {
        if (carts.length > 0) {
            return carts[carts.length - 1].id + 1
        } else {
            return 1
        }
    }
    getAllCarts = async() => {
        const cartsJson = await fs.promises.readFile(this.path, "utf-8")
        const carts = JSON.parse(cartsJson);
        return carts;
    }
    // Crear un cart
    createCart = async(newCart) => {
        try {
            const carts = await this.getAllCarts();
            const newCart = { id: this.generateId(carts), products: [] };
            carts.push(newCart);
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return newCart;
        } catch (error) {
            throw new Error("Error al crear el carrito: " + error.message);
        }
    }
    // Obtener un cart por id
    getCartById = async(cid) => {
        try {
            const carts = await this.getAllCarts();
            const cart = carts.find(cartdata => cartdata.id == cid);
            if (!cart) throw new Error(`No se encontró el carrito con ID ${cid}`);
            return cart;
        } catch (error) {
            throw new Error("Error al obtener el carrito: " + error.message);
        }
    }

    // Agrega un producto a un carrito
    addProductToCart = async(cid, pid, quantity) => {
        const cartsJson = await fs.promises.readFile(this.path, "utf-8")
        const carts =   JSON.parse(cartsJson);

        const cart = carts.find(c => c.id == cid);
        if (!cart) throw new Error(`Carrito con ID ${cid} no encontrado`);

        let producto = cart.products.find(p => p.id == pid);

        if (producto) {
            producto.quantity += quantity;
        } else {
            cart.products.push({ id: pid, quantity });
        }

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2), "utf-8")
        return carts
    }




}
export default CartManager;