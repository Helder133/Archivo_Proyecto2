const BitacoraModel = require('../models/bitacora.model');

class BitacoraRepository {

    async create(bitacoraData, session = null) {
        const options = session ? { session } : {};
        const result = await BitacoraModel.create([bitacoraData], options);
        return result[0]._id.toString();
    }

    async findAll() {
        return await BitacoraModel.find()
            .sort({ fecha: -1 })
            .lean();
    }
}

module.exports = new BitacoraRepository();