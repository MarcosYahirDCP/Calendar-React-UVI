// firestoreFunctions.js
import { collection, getDocs } from "firebase/firestore";
import db from "../firebase";


export const obtenerDocumentos = async (coleccion) => {
    try {
        // Obtiene una referencia a la colección
        const colRef = collection(db, coleccion);
        // Obtiene todos los documentos de la colección
        const querySnapshot = await getDocs(colRef);
        
        // Crea un array para almacenar los documentos
        const documentos = [];
        
        // Itera sobre cada documento en el snapshot
        querySnapshot.forEach((doc) => {
            // Agrega el documento al array
            documentos.push({ id: doc.id, ...doc.data() });
        });

        // Devuelve el array de documentos
        return documentos;
    } catch (error) {
        console.error("Error al obtener documentos:", error);
        throw error;
    }
};
