import fs from 'fs'

class ProductManager {
    constructor() {
        this.path = './src/data/products.json';
    }

generateNewId = (products)=> {
    if (products.length > 0) {
        return products [products.length - 1].id + 1;
    }else{
        return 1;
    }
}

getProducts = async () => {
    const productsJson = await fs.promises.readFile(this.path, 'utf-8');
    const products = JSON.parse(productsJson);
    return products;
    }


AddProduct = async (newProduct) => {
    // Lee el archivo .json
    const productsJson = await fs.promises.readFile(this.path, 'UTF-8');
    // Convierte el Contenido de JSON a un array de productos
    const products = JSON.parse(productsJson);
    // Genera un id Unico para el nuevo Producto
    const id = this.generateNewId(products);
    const productToAdd = { id, ...newProduct };
    products.push(productToAdd);
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2), 'utf-8');
    // Devuelve la lista actualizada de productos
    return productToAdd;

}
//Actualiza los datos del producto por su id
updateProductById = async (id, updatedData) => {
    // Lee el archivo .json
    const productsJson = await fs.promises.readFile(this.path, 'utf-8');
    // Convierte el Contenido de JSON a un array de productos
    const products = JSON.parse(productsJson);
    // Busca el indice del producto para actualizarlo
    const product = products.find((product) => product.id === id);
    if (product){
        Object.assign(product, updatedData);
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2), 'utf-8');
    return product;
    }
    return null;
    }

    //Delete ProductById
    deleteProductById = async (id) => {
    // Lee el archivo .json
    const productsJson = await fs.promises.readFile(this.path, 'UTF-8');
    // Convierte el Contenido de JSON a un array de productos
    const products = JSON.parse(productsJson);
    //Filtra productos, eliminando el producto que tiene el id proporcionado
    const updatedProducts = products.filter((product) => product.id !== id);
    // Sobreescribe el archivo .json con la lista filtrada
    await fs.promises.writeFile(this.path, JSON.stringify(updatedProducts, null, 2), 'utf-8');
    return updatedProducts;
    }
}


export default ProductManager;