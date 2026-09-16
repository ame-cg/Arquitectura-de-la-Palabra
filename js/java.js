// -------------------------------------------------
// BUSCAR LOS ELEMENTOS DEL HTML
// -------------------------------------------------

const canvas=
  document.getElementById("artCanvas");

const ctx =
  canvas.getContext("2d");

const input =
  document.getElementById("wordInput");

const styleSelect =
  document.getElementById("styleSelect");

const alphaSelect =
  document.getElementById("alphaSelect");

const regenerateBtn =
  document.getElementById("regenerateBtn");

const downloadBtn =
  document.getElementById("downloadBtn");

const mensaje =
  document.getElementById("mensaje");


// -------------------------------------------------
// BANCO DE IMÁGENES
// -------------------------------------------------

// Aquí se guardarán las imágenes cargadas.
const bancoImagenes = {};


// Las 27 letras que reconoce el programa.
const alfabeto =
  "abcdefghijklmnñopqrstuvwxyz";


// Tus imágenes son archivos JPEG.
const extensionImagenes =
  "jpeg";


// Tus imágenes están dentro de la carpeta img.
const carpetaImagenes =
  "img";


// Contadores para controlar la carga.
let cantidadCargadas = 0;
let cantidadConError = 0;


// -------------------------------------------------
// CARGAR LAS IMÁGENES
// -------------------------------------------------

function cargarBancoDeImagenes() {

  alfabeto.split("").forEach(function (letra) {

    const imagen = new Image();


    imagen.onload = function () {

      cantidadCargadas++;

      actualizarMensajeDeCarga();

      // Volver a dibujar cada vez que carga
      // una imagen.

      
      renderArt();
    };


    imagen.onerror = function () {

      cantidadConError++;

      console.warn(
        `No se encontró: ${imagen.src}`
      );

      actualizarMensajeDeCarga();
    };


    // Guardar el objeto imagen usando
    // la letra como nombre.
    bancoImagenes[letra] = imagen;


    // Ejemplos de las rutas generadas:
    // img/a.png
    // img/b.png
    // img/enie.png
    // Para la ñ usamos un nombre sin caracteres especiales.
const nombreArchivo =
  letra === "ñ" ? "enie" : letra;

imagen.src =
  `${carpetaImagenes}/${nombreArchivo}.${extensionImagenes}`;

  });

}


// -------------------------------------------------
// MOSTRAR EL ESTADO DE LA CARGA
// -------------------------------------------------

function actualizarMensajeDeCarga() {

  const cantidadProcesadas =
    cantidadCargadas + cantidadConError;


  if (cantidadProcesadas < alfabeto.length) {

    mensaje.textContent =
      `Cargando imágenes: ${cantidadProcesadas} de ${alfabeto.length}`;

    return;
  }


  if (cantidadConError === 0) {

    mensaje.textContent =
      "Las 27 imágenes fueron cargadas correctamente.";

  } else {

    mensaje.textContent =
      `Imágenes cargadas: ${cantidadCargadas}. ` +
      `No encontradas: ${cantidadConError}.`;

  }

}


// -------------------------------------------------
// LIMPIAR LA PALABRA
// -------------------------------------------------

function limpiarTexto(texto) {

  return texto

    // Pasar todo a minúsculas.
    .toLowerCase()

    // Reemplazar las vocales con tilde.
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")

    // Conservar únicamente las letras.
    // La letra ñ también se conserva.
    .replace(/[^a-zñ]/g, "");

}


// -------------------------------------------------
// COMPROBAR SI UNA IMAGEN ESTÁ DISPONIBLE
// -------------------------------------------------

function imagenDisponible(imagen) {

  return (
    imagen &&
    imagen.complete &&
    imagen.naturalWidth > 0
  );

}


// -------------------------------------------------
// LIMPIAR EL CANVAS
// -------------------------------------------------

function limpiarCanvas() {

  ctx.globalAlpha = 1;

  ctx.globalCompositeOperation =
    "source-over";


  ctx.fillStyle =
    "#0a0a0c";


  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

}


// -------------------------------------------------
// DIBUJAR LA OBRA
// -------------------------------------------------

function renderArt() {

  const texto =
    limpiarTexto(input.value);

  const modo =
    styleSelect.value;

  const opacidad =
    parseFloat(alphaSelect.value);


  limpiarCanvas();


  if (texto.length === 0) {

    mensaje.textContent =
      "Escribí una palabra para crear una imagen.";

    return;

  }


  if (modo === "grid") {

    dibujarMosaico(texto);

  } else {

    dibujarSuperposicion(
      texto,
      modo,
      opacidad
    );

  }


  // Restablecer los valores normales.
  ctx.globalAlpha = 1;

  ctx.globalCompositeOperation =
    "source-over";

}


// -------------------------------------------------
// SUPERPOSICIÓN, MEZCLA Y SUSTRACCIÓN
// -------------------------------------------------

function dibujarSuperposicion(
  texto,
  modo,
  opacidad
) {

  texto.split("").forEach(
    function (letra, posicion) {

      const imagen =
        bancoImagenes[letra];


      if (!imagenDisponible(imagen)) {
        return;
      }


      ctx.save();


      // -------------------------------------------
      // ELEGIR EL TIPO DE MEZCLA
      // -------------------------------------------

      if (modo === "superposition") {

        ctx.globalCompositeOperation =
          "source-over";

        ctx.globalAlpha =
          opacidad;

      }


      if (modo === "blended") {

        const modosDeMezcla = [
          "screen",
          "multiply",
          "overlay",
          "difference",
          "color-dodge"
        ];


        ctx.globalCompositeOperation =
          modosDeMezcla[
            posicion % modosDeMezcla.length
          ];


        ctx.globalAlpha =
          opacidad;

      }


      if (modo === "subtraction") {

        if (posicion === 0) {

          // La primera letra crea la base.
          ctx.globalCompositeOperation =
            "source-over";

          ctx.globalAlpha = 1;

        } else {

          // Las siguientes letras borran
          // partes de la imagen anterior.
          ctx.globalCompositeOperation =
            "destination-out";

          ctx.globalAlpha =
            opacidad;

        }

      }


      // -------------------------------------------
      // TAMAÑO ALEATORIO
      // -------------------------------------------

      const escala =
        0.5 + Math.random() * 0.6;


      const ancho =
        canvas.width * escala;


      const alto =
        canvas.height * escala;


      // -------------------------------------------
      // POSICIÓN ALEATORIA
      // -------------------------------------------

      const x =
        Math.random() *
        (canvas.width - ancho * 0.5) -
        ancho * 0.25;


      const y =
        Math.random() *
        (canvas.height - alto * 0.5) -
        alto * 0.25;


      // Colocar el punto de origen
      // en el centro de la imagen.
      ctx.translate(
        x + ancho / 2,
        y + alto / 2
      );


      // Rotar la imagen.
      const rotacion =
        (Math.random() - 0.5) * 0.8;


      ctx.rotate(rotacion);


      // Dibujar la imagen centrada.
      ctx.drawImage(
        imagen,
        -ancho / 2,
        -alto / 2,
        ancho,
        alto
      );


      ctx.restore();

    }
  );

}


// -------------------------------------------------
// MOSAICO GEOMÉTRICO
// -------------------------------------------------

function dibujarMosaico(texto) {

  const cantidadLetras =
    texto.length;


  const columnas =
    Math.ceil(
      Math.sqrt(cantidadLetras)
    );


  const filas =
    Math.ceil(
      cantidadLetras / columnas
    );


  const anchoCelda =
    canvas.width / columnas;


  const altoCelda =
    canvas.height / filas;


  texto.split("").forEach(
    function (letra, posicion) {

      const imagen =
        bancoImagenes[letra];


      if (!imagenDisponible(imagen)) {
        return;
      }


      const columna =
        posicion % columnas;


      const fila =
        Math.floor(
          posicion / columnas
        );


      const x =
        columna * anchoCelda;


      const y =
        fila * altoCelda;


      ctx.drawImage(
        imagen,
        x,
        y,
        anchoCelda,
        altoCelda
      );

    }
  );

}


// -------------------------------------------------
// GUARDAR LA IMAGEN
// -------------------------------------------------

function descargarImagen() {

  const nombrePalabra =
    limpiarTexto(input.value) ||
    "abstracto";


  const enlace =
    document.createElement("a");


  enlace.download =
    `arte-${nombrePalabra}.png`;


  enlace.href =
    canvas.toDataURL("image/png");


  enlace.click();

}


// -------------------------------------------------
// EVENTOS
// -------------------------------------------------

input.addEventListener(
  "input",
  renderArt
);


styleSelect.addEventListener(
  "change",
  renderArt
);


alphaSelect.addEventListener(
  "change",
  renderArt
);


regenerateBtn.addEventListener(
  "click",
  renderArt
);


downloadBtn.addEventListener(
  "click",
  descargarImagen
);


// -------------------------------------------------
// INICIAR EL PROGRAMA
// -------------------------------------------------

limpiarCanvas();

cargarBancoDeImagenes();
