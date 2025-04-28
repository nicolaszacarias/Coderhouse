import express from 'express';
import ProductManager from '../productManager';

viewRouter = express.Router()

const productManager = new ProductManager('./src/data/products.json');

viewRouter.get('/', async(req, res) => {
    try{
        const products = await productManager.getAllProducts();
        res.render('home', {products})
    }
    catch(error){
        res.status(500).send({message: error.message})
    }
    res.render('home')
})

viewRouter.get('/realtimeproducts', async(req, res) => {
    try{
        const products = await productManager.getAllProducts();
        res.render('realtimeproducts', {products})
    }
    catch(error){
        res.status(500).send({message: error.message})
    }
    res.render('home')
})


export default viewRouter;