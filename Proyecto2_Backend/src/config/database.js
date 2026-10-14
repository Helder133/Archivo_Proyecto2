const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
require('dotenv').config()

class Database {
    constructor() {
        this.bucket = null;
        this.uri = process.env.MONGODB_URI;
        this.dbName = process.env.DATABASE_NAME;
    }

    async connect() {
        try {
            await mongoose.connect(this.uri, {
                dbName: this.dbName
            });

            const db= mongoose.connection.db;

            this.bucket = new GridFSBucket(db, {
                bucketName: 'archivos_fisicos' 
            });

            console.log("✅ Conexión exitosa a MongoDB");
        } catch (error) {
            console.error("❌ Error conectando a MongoDB:", error);
            process.exit(1);
        }
    }

    getDb() {
        const db = mongoose.connection.db;

        if (!db) throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        
        return db;
    }

    getBucket() {
        if (!this.bucket) throw new Error("GridFS no está inicializado.");
        return this.bucket;
    }

    getClient() {
        const client = mongoose.connection.getClient();
        if (mongoose.connection.readyState !== 1) throw new Error("El cliente de MongoDB no está inicializado. Llama a connect() primero.");
        return client;
    }

    async disconnect() {
        this.bucket = null;
        await mongoose.disconnect();
        console.log("✅ Desconectado de MongoDB");
    }
}

module.exports = new Database();