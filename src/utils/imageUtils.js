/**
 * utils/imageUtils.js
 *
 * Funciones auxiliares para el procesamiento de imágenes en el cliente.
 * Usamos Canvas para redimensionar imágenes antes de guardarlas
 * como base64 en la base de datos, reduciendo el tamaño final.
 */

/**
 * Redimensiona una imagen (File) al tamaño máximo indicado
 * y la devuelve como un string base64 (JPEG al 60% de calidad).
 *
 * @param {File} file - Archivo de imagen seleccionado por el usuario.
 * @param {number} maxWidth - Ancho máximo en píxeles.
 * @param {number} maxHeight - Alto máximo en píxeles.
 * @returns {Promise<string>} - Promesa que resuelve con el data URL de la imagen redimensionada.
 */
export function resizeImage(file, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
        };
    });
}
