import fs from "fs";

class ProductManager {
    constructor(){
        this.path = "./products.json";
    }

    generateId = (products) => {
        if (products.length > 0) {
            return products[products.length - 1].id + 1
        } else {
            return 1
        }
    }
    // Obtener Todos los Productos
    getAllProducts = async() => {
        const productsJson = await fs.promises.readFile(this.path, "utf-8")
        const products = JSON.parse(productsJson);
        return products;
    }

    // Crear los Productos
    createProducts = async(newProduct) => {
        const productsJson = await fs.promises.readFile(this.path, "utf-8")
        const products = JSON.parse(productsJson)
        const id = this.generateId(products);
        products.push({id, ...newProduct})
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2))
        return products;
    };
    // Actualizar los productos por id
    updateProductsById = async(productId, updatedData) => {
        const productsJson = await fs.promises.readFile(this.path, "utf-8")
        const products = JSON.parse(productsJson)
        const index = products.findIndex(products => products.id == productId)
        products[index] = {...products[index], ...updatedData}
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2))
        return products;
    };


    // Borrar productos por id
    deleteProductsById = async(id) => {
        const productsJson = await fs.promises.readFile(this.path, "utf-8")
        const products = JSON.parse(productsJson)
        const productsFilter = products.filter(product => product.id != id)
        if (products.length === productsFilter.length) {
            throw new Error(`No se encontró el producto con ID ${id}`);
        }
        await fs.promises.writeFile(this.path, JSON.stringify(productsFilter, null))
        return productsFilter
    }
    // Obtener producto por id
    getProductsById = async(id) => {
        const productsJson = await fs.promises.readFile(this.path, "utf-8")
        const products = JSON.parse(productsJson)
        const productsfind = products.find(product => product.id === Number(id))
        if (!productsfind) {
            throw new Error(`No se encontró el producto con ID ${id}`);
        }
        return productsfind
    }

}


export default ProductManager;