async function generatePDF() {

    // Obtener los valores del formulario
    const name = document.getElementById('name').value;
    const surname = document.getElementById('apellido').value;
    const coordinator = document.getElementById('coordinadora').value;
    const date = document.getElementById('fecha').value;
    const surgeryDate = document.getElementById('fechaCirujia').value;
    const surgicalTretament = document.getElementById('tratamientoQuirurjico').value;
    const preTreatment = document.getElementById('tratamientoPrevio').value;
    const specialPrice = document.getElementById('precioEspecialCirujia').value;
    const kitPrice = document.getElementById('preciokit').value;
    const UF = document.getElementById('unidadesFoliculares').value;
    const prescriptionTime = document.getElementById('tiempoDePrescripción').value; 
    const techniqe = document.getElementById('tecnicaQuirurjica').value;
    const identificationDocument = document.getElementById('documentoIdentidad').value; 
 



    // Cargar el PDF existente
    const existingPdfBytes = await fetch('resources/js/PSP/PanoPDF1.pdf').then(res => res.arrayBuffer());


    // Cargar el PDF con pdf-lib
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Obtener la primera página del documento
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Definir la fuente y el tamaño del texto
    const fontSize = 12;
    const timesRomanFont = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman);
    

    // Agregar el texto a la primera página en las posiciones especificadas
    firstPage.drawText(`${name}`, {
        x: 200,
        y: 670,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${surname}`, {
        x: 200,
        y: 646,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${identificationDocument}`, {
        x: 254,
        y: 132,
        size: 10,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${coordinator}`, {
        x: 200,
        y: 621,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${surgeryDate}`, {
        x: 200,
        y: 597,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

    firstPage.drawText(`${date}`, {
        x: 410,
        y: 670,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

        // Verificar la opción seleccionada y dibujar una "X" en la posición correspondiente
    if (surgicalTretament === 'si') {
        firstPage.drawText('X', {
            x: 240, 
            y: 504, 
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
    } else if (surgicalTretament === 'no') {
        firstPage.drawText('X', {
            x: 283, 
            y: 504, 
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
    }

    if (preTreatment === 'si') {
        firstPage.drawText('X', {
            x: 240, 
            y: 464, 
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
    } else if (preTreatment === 'no') {
        firstPage.drawText('X', {
            x: 283, 
            y: 464, 
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
    }
    firstPage.drawText(`${techniqe}`, {
        x: 228,
        y: 438,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    });

        // Comprueba que haya contenido para no escribir el texto estra sin el valorl, en este caso 'dias'
    if (prescriptionTime !== null && prescriptionTime !== undefined && prescriptionTime.toString().trim() !== '') {
        firstPage.drawText(`${prescriptionTime} dias`, {
            x: 420,
            y: 510,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
    }

    if (UF !== null && UF !== undefined && UF.toString().trim() !== '') {
        firstPage.drawText(`${UF} uf`, {
            x: 420,
            y: 472,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        firstPage.drawText('• Revisiones ilimitadas.\n• Sesiones luz LED.\n• PRP intraoperatoria.\n• Curas y lavados postoperatorio.\n• Financiación a tu medida', {
            x: 226,
            y: 384,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

    if (kitPrice !== null && kitPrice !== undefined && kitPrice.toString().trim() !== '') {
        firstPage.drawText(`${kitPrice}€`, {
            x: 228,
            y: 221,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
    }
}

    if (specialPrice !== null && specialPrice !== undefined && specialPrice.toString().trim() !== '') {
        firstPage.drawText(`${specialPrice}€`, {
            x: 228,
            y: 243,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
    }
 
    // Guarda Los cambios (serializa)
    const pdfBytes = await pdfDoc.save();

    // Descargar el PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'datos_usuario.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}



function fetchSuggestions(query) {
    if (query.length === 0) {
        document.getElementById("suggestions").innerHTML = "";
        return;
    }

    fetch(`fetch_suggestions.php?query=${query}`)
        .then(response => response.json())
        .then(data => {
            let suggestionsList = document.getElementById("suggestions");
            suggestionsList.innerHTML = "";
            data.forEach(item => {
                let li = document.createElement("li");
                li.textContent = `${item.name} ${item.surname}`;
                li.onclick = () => {
                    document.getElementById("nombreCompleto").value = li.textContent;
                    document.getElementById("name").value = item.name;
                    document.getElementById("apellido").value = item.surname;
                    suggestionsList.innerHTML = "";
                };
                suggestionsList.appendChild(li);
            });
        });
}
