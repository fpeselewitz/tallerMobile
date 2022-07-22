var map;
function mostrar_resultado(data) {
    //console.log(data);
    if(map != undefined){
        map.remove();
    }
    map = L.map('map').setView([data.lat, data.lon], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([data.lat, data.lon]).addTo(map)
        .bindPopup(data.display_name)
        .openPopup();
}

window.onload = function () {
    document.getElementById('btn_consultar').onclick = function () {
        const calle = document.getElementById('inp_calle').value;
        const numero = document.getElementById('inp_numero').value;
        try {
            if (!calle) {
                throw 'Nombre de calle requerido para continuar';
            }
            if (!numero) {
                throw 'Numero de calle requerido para continuar';
            }
            if (isNaN(numero)) {
                throw 'Numero de calle solo digitos';
            }
            // request API de direcciones con nombre de calle y número para obtener lat, lon.
            const busqueda = `${calle} ${numero}`;
            const url = `https://nominatim.openstreetmap.org/search?street=${busqueda}&city=Montevideo&country=Uruguay&format=json`;
            fetch(url)
                .then(respuesta => respuesta.json())
                .then(data => mostrar_resultado(data[0]))
        }
        catch (e) {
            alert(e);
        }
    }
}