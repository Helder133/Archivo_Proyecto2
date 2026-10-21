const BitacoraModel = require('../models/bitacora.model');

class BitacoraRepository {

    async create(bitacoraData, session = null) {
        const options = session ? { session } : {};
        const result = await BitacoraModel.create([bitacoraData], options);
        return result[0]._id.toString();
    }

    async findAll() {
        const registros = await BitacoraModel.find()
            // .populate recibe el campo a cruzar y los campos específicos que quieres traer
            .populate('usuarioId', 'nombre email')
            .sort({ fecha: -1 })
            .lean();

        // Aplanamos el resultado para que la tabla en Angular lo lea sin problemas
        return registros.map(registro => ({
            ...registro,
            // Extraemos el nombre y correo a nivel raíz. Si el usuario fue borrado físicamente, mostramos "Usuario Desconocido"
            usuarioNombre: registro.usuarioId ? registro.usuarioId.nombre : 'Usuario Desconocido',
            usuarioEmail: registro.usuarioId ? registro.usuarioId.email : 'N/A',
            // Opcional: Conservamos el ID crudo por si lo necesitas
            usuarioId: registro.usuarioId ? registro.usuarioId._id : null
        }));
    }
}

module.exports = new BitacoraRepository();