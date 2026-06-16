/**
* Project     : Sample Vault
* Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
* License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
* Date        : Marzo 2026
*/

const fileHelper = require('../utils/fileHelper');
const sampleRepo = require('../repositories/sampleRepo');

class SampleController 
{
    // Método para subir un sample y guardarlo en la BD
    async uploadSample(req, res) 
    {
        try
        {
            // 1. Validación de archivo y datos obligatorios
            if (!req.file)
            {
                return res.status(400).json({ message: "No se subió ningún archivo o el formato es inválido." });
            }

            const { display_name, category, bpm } = req.body;
            
            if (!display_name || !category) {
                // Si faltan datos, eliminamos el archivo físico para no dejar basura (Storage Efficiency)
                fileHelper.deleteFile(`/uploads/${req.file.filename}`);
                return res.status(400).json({ message: "El nombre y la categoría son obligatorios." });
            }

            // Consigna 6. validacion del BPM en caso de que ingrese un numero no valido o un texto
            let ValidacionBpm = null;
            if (bpm && bpm.trim() != ""){
                ValidacionBpm = parseInt(bpm,10);
                
                if (isNaN(ValidacionBpm) || ValidacionBpm < 20 || ValidacionBpm > 300) {
                    fileHelper.deleteFile(`/uploads/${req.file.filename}`);
                    return res.status(400).json({message: "BPM inválido. Ingrese un valor numérico correcto" });
                }
            }

            const userId = req.userId; // Proveniente del verifyToken
            const filename = req.file.filename;
            const filePath = `/uploads/${filename}`;

            // 2. Persistencia mediante el SP sp_create_sample
            const insertId = await sampleRepo.create({
                user_id: userId,
                filename,
                display_name,
                category,
                bpm: ValidacionBpm,
                file_path: filePath
            });

            res.status(201).json({ 
                message: "Sample cargado exitosamente en la biblioteca.", 
                id: insertId,
                path: filePath 
            });
        }
        catch (error)
        {
            // En caso de error de DB, intentar limpiar el archivo físico
            if (req.file) fileHelper.deleteFile(`/uploads/${req.file.filename}`);
            
            res.status(500).json({ message: "Error durante la carga del sample.", error: error.message });
        }
    }

    // Listar samples del productor logueado
    async getMySamples(req, res)
    {
        try
        {
            // El SP sp_find_samples_by_user filtra automáticamente por user_id
            const samples = await sampleRepo.findByUserId(req.userId);
            res.json(samples);
        }
        catch (error)
        {
            res.status(500).json({ message: "Error al recuperar la biblioteca.", error: error.message });
        }
    }

    // Eliminar un sample de la biblioteca
    async deleteSample(req, res) 
    {
        try 
        {
            const { id } = req.params;
            const userId = req.userId;

            // 1. Obtener metadatos para conocer la ruta del archivo físico
            const sample = await sampleRepo.findById(id, userId);

            if (!sample) {

              const existingSample = await sampleRepo.findAnyById(id);

             if (existingSample) {
               return res.status(403).json({
                    message: "No tienes permisos para alterar este archivo"
               });
             }

             return res.status(404).json({
                message: "El registro no existe o ya fue eliminado"
             });

            }

            // 2. Ejecutar sp_delete_sample en la base de datos
            const affectedRows = await sampleRepo.delete(id, userId);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: "El registro no existe o ya fue eliminado"
                });
            }

            // 3. Eliminación física del archivo
            if (sample?.file_path) {
                fileHelper.deleteFile(sample.file_path);
            }

            return res.json({
                message: "Registro eliminado y archivo físico removido con éxito."
            });
        }
        catch (error)
        {
            res.status(500).json({
                message: "Error al eliminar el sample.",
                error: error.message
            });
        }
    }
}
module.exports = new SampleController();