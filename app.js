/*
  CookieLab - app.js
  Web que recuerda al usuario mediante cookies.

  Cookies utilizadas:
    usuario    nombre del usuario
    tema       "oscuro" o "claro"
    idioma     "es" o "en"
    visitas    número de visitas
    ultima     fecha de la última visita (opcional, nota final)
    caduca1min cookie de prueba que dura 1 minuto (opcional, nota final)
*/

/* ---------- Constantes y referencias al HTML ---------- */

// max-age se expresa en segundos: 30 días * 24 h * 60 min * 60 s
const SEGUNDOS_30_DIAS = 30 * 24 * 60 * 60;

const saludo = document.getElementById("saludo");
const visitasTexto = document.getElementById("visitas");
const ultimaTexto = document.getElementById("ultima");
const selectTema = document.getElementById("tema");
const selectIdioma = document.getElementById("idioma");
const btnCambiar = document.getElementById("btnCambiar");
const btnOlvidar = document.getElementById("btnOlvidar");

// Textos del saludo según el idioma elegido
const SALUDOS = {
  es: { primera: "Bienvenido", vuelta: "Hola de nuevo" },
  en: { primera: "Welcome", vuelta: "Welcome back" }
};

/* ---------- Las 3 operaciones con cookies ---------- */

/**
 * Guarda una cookie.
 * @param {string} clave - Nombre de la cookie.
 * @param {string} valor - Valor que se guarda (siempre como texto).
 * @param {number} segundos - Tiempo de vida de la cookie, en segundos.
 */
function guardarCookie(clave, valor, segundos) {
  document.cookie = clave + "=" + encodeURIComponent(valor) + "; max-age=" + segundos + "; path=/";
}

/**
 * Lee una cookie por su nombre.
 * document.cookie devuelve todas juntas ("a=1; b=2"), así que se separan
 * y se busca la que empieza por el nombre pedido.
 * @param {string} clave - Nombre de la cookie.
 * @returns {string|null} Su valor, o null si no existe.
 */
function leerCookie(clave) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    if (cookie.startsWith(clave + "=")) {
      return decodeURIComponent(cookie.substring(clave.length + 1));
    }
  }
  return null;
}

/**
 * Borra una cookie poniendo su tiempo de vida a 0.
 * @param {string} clave - Nombre de la cookie.
 */
function borrarCookie(clave) {
  document.cookie = clave + "=; max-age=0; path=/";
}

/* ---------- Funciones de apoyo ---------- */

/**
 * Pide el nombre con prompt.
 * @returns {string|null} El nombre, o null si se cancela o se deja vacío.
 */
function pedirNombre() {
  const respuesta = prompt("¿Cómo te llamas?");
  if (respuesta === null || respuesta.trim() === "") {
    return null;
  }
  return respuesta.trim();
}

/** Aplica el tema: añade o quita la clase "claro" del body. */
function aplicarTema() {
  document.body.classList.toggle("claro", tema === "claro");
}

/** Escribe el saludo en el idioma elegido. */
function mostrarSaludo() {
  if (nombre === null) {
    saludo.textContent = "";
    return;
  }
  const texto = primeraVisita ? SALUDOS[idioma].primera : SALUDOS[idioma].vuelta;
  saludo.textContent = texto + ", " + nombre;
}

/* ---------- Fase 3: aplicar las preferencias guardadas ---------- */

// Si no hay cookie, se usan los valores por defecto
let tema = leerCookie("tema") || "oscuro";
let idioma = leerCookie("idioma") || "es";

selectTema.value = tema;
selectIdioma.value = idioma;
aplicarTema();

/* ---------- Fases 1 y 2: guard de primera visita ---------- */

let nombre = leerCookie("usuario");
let primeraVisita = false;

if (nombre === null) {
  // Primera visita: se pide el nombre, se guarda 30 días y se da la bienvenida
  nombre = pedirNombre();
  if (nombre !== null) {
    guardarCookie("usuario", nombre, SEGUNDOS_30_DIAS);
    primeraVisita = true;
    alert(SALUDOS[idioma].primera + ", " + nombre);
  }
}
// Si la cookie ya existía no se pregunta nada: mostrarSaludo() dirá "Hola de nuevo"

mostrarSaludo();

/* ---------- Fase 4: contador de visitas ---------- */

let visitas = 1; // valor inicial si la cookie no existe
const visitasGuardadas = leerCookie("visitas");
if (visitasGuardadas !== null) {
  // La cookie guarda texto: se convierte a número antes de sumar
  visitas = Number(visitasGuardadas) + 1;
}
guardarCookie("visitas", visitas, SEGUNDOS_30_DIAS);
visitasTexto.textContent = "Has visitado esta página " + visitas + " veces";

/* ---------- Final (opcional): fecha de la última visita ---------- */

const ultima = leerCookie("ultima");
if (ultima !== null) {
  ultimaTexto.textContent = "Tu última visita fue el " + new Date(ultima).toLocaleString("es-ES");
}
// Se guarda la fecha de hoy para mostrarla la próxima vez
guardarCookie("ultima", new Date().toISOString(), SEGUNDOS_30_DIAS);

/* ---------- Final (opcional): cookie que caduca a 1 minuto ---------- */

guardarCookie("caduca1min", "prueba", 60);

/* ---------- Fase 3: guardar las preferencias al cambiarlas ---------- */

selectTema.addEventListener("change", function () {
  tema = selectTema.value;
  guardarCookie("tema", tema, SEGUNDOS_30_DIAS);
  aplicarTema();
});

selectIdioma.addEventListener("change", function () {
  idioma = selectIdioma.value;
  guardarCookie("idioma", idioma, SEGUNDOS_30_DIAS);
  mostrarSaludo();
});

/* ---------- Fase 5: panel de control ---------- */

// Cambia el nombre: actualiza la cookie y el saludo
btnCambiar.addEventListener("click", function () {
  const nuevoNombre = pedirNombre();
  if (nuevoNombre !== null) {
    nombre = nuevoNombre;
    primeraVisita = false;
    guardarCookie("usuario", nombre, SEGUNDOS_30_DIAS);
    mostrarSaludo();
  }
});

// Olvidarme: tras confirmar, borra todas las cookies
btnOlvidar.addEventListener("click", function () {
  if (confirm("¿Seguro que quieres borrar todos tus datos?")) {
    const cookies = ["usuario", "tema", "idioma", "visitas", "ultima", "caduca1min"];
    cookies.forEach(borrarCookie);

    nombre = null;
    saludo.textContent = "Datos borrados. Recarga la página.";
    visitasTexto.textContent = "";
    ultimaTexto.textContent = "";
  }
});