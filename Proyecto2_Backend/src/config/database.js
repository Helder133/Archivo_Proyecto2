const { MongoClient, GridFSBucket } = require('mongodb');
require('dotenv').config()

class Database {
    constructor() {
        this.client = null;
        this.db = null;
        this.bucket = null;
        this.uri = process.env.MONGODB_URI;
        this.dbName = process.env.DATABASE_NAME;
    }

    async connect() {
        try {
            this.client = new MongoClient(this.uri);
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.bucket = new GridFSBucket(this.db, { bucketName: 'archivos_fisicos' });

            console.log("✅ Conexión exitosa a MongoDB");
        } catch (error) {
            console.error("❌ Error conectando a MongoDB:", error);
            process.exit(1);
        }
    }

    getDb() {
        if (!this.db) throw new Error("La base de datos no está inicializada. Llama a connect() primero.");
        return this.db;
    }

    getBucket() {
        if (!this.bucket) throw new Error("GridFS no está inicializado.");
        return this.bucket;
    }

    getClient() {
        if (!this.client) throw new Error("El cliente de MongoDB no está inicializado. Llama a connect() primero.");
        return this.client;
    }
}

module.exports = new Database();