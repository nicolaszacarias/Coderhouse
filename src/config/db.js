import mongoose from "mongoose";

const connectMongoDb = async() => {
    try {
        await mongoose.connect("mongodb+srv://zacariasnicolas95:WW8jXSwaBCrScqH5@cluster0.ao02tx4.mongodb.net/MyEcommerse?retryWrites=true&w=majority&appName=Cluster0");
        console.log("Conectado con MongoDb!");
    } catch (error) {
        console.log("Error al conectar con mongodb");
    }
}

export default connectMongoDb;