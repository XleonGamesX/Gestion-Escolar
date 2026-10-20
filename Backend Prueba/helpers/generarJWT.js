import jwt from "jsonwebtoken";

/**
 * Genera un JSON Web Token para un usuario.
 *
 * ¿Que es un JWT? Un texto largo con tres partes separadas por puntos:
 *
 *   eyJhbGciOi...  .  eyJ1aWQiOi...  .  SflKxwRJSM...
 *   \___________/     \____________/     \__________/
 *      header             payload           firma
 *
 * - header:  que algoritmo se uso.
 * - payload: los datos que quisimos guardar. Aqui solo va el "uid" (el id del
 *            usuario). Se puede LEER sin la clave, asi que NUNCA se mete ahi
 *            una contraseña ni datos sensibles.
 * - firma:   se calcula con SECRETORPRIVATEKEY. Si alguien cambia una letra del
 *            payload, la firma deja de coincidir y el token queda invalido.
 *
 * Por eso el token no se "guarda" en ninguna tabla: el servidor lo verifica con
 * su clave secreta cada vez que llega.
 *
 * @param {string} uid - Id del usuario que inicio sesion.
 * @returns {Promise<string>} el token firmado.
 */
const generarJWT = (uid = "") => {
  // jwt.sign trabaja con callback; se envuelve en una Promesa para poder usar
  // await desde el controlador.
  return new Promise((resolve, reject) => {
    const payload = { uid };

    jwt.sign(
      payload,
      process.env.SECRETORPRIVATEKEY,
      {
        expiresIn: "4h", // pasadas 4 horas el token deja de servir
      },
      (error, token) => {
        if (error) {
          console.log(error);
          reject("No fue posible generar el token");
        } else {
          resolve(token);
        }
      }
    );
  });
};

export { generarJWT };
