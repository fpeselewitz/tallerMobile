var map;
function display_toast(mensaje, header, color){
    const toast = document.createElement('ion-toast');
    toast.header = header;
    toast.icon = 'information-circle',
    toast.position = 'top';
    toast.message = mensaje;
    toast.duration = 3000;
    toast.color = color;
    document.body.appendChild(toast);
    toast.present();
}

function getParam(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function login(data, router){
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("usuario", JSON.stringify(data.usuario))
    router.push('/locales');
}

function listar_locales(){
    let token = sessionStorage.getItem("token");
    const url = 'https://ort-tddm.herokuapp.com/locales/';
    fetch(url, {
        headers:{
            "Content-type":"application/json",
            "Authorization": `Bearer ${token}`
        }
    }).then(respuesta => respuesta.json())
    .then(data => crear_listado_locales(data))
}

function crear_listado_locales(data){
    let usuario = sessionStorage.getItem("usuario");
    usuario = JSON.parse(usuario);
    document.getElementById('list_locales_header').innerHTML = `Hola <strong>${usuario.nombre}</strong>!`;
    //console.log(data);
    let lista = document.getElementById('list_locales');
    let item = '';
    data.forEach(function(local){
        item = `<ion-item href="/local?id=${local._id}" detail>
        <ion-avatar slot="start">
          <img src="${local.imagen}" />
        </ion-avatar>
        <ion-label>
          <h2>${local.nombre}</h2>
          <h3>${local.horario}</h3>
          <p>${local.servicios}</p>
        </ion-label>
      </ion-item>`;
      lista.innerHTML += item;
    });
}

function info_local(){
    const local_id = getParam('id');   
    const url = `https://ort-tddm.herokuapp.com/locales/${local_id}`;
    let token = sessionStorage.getItem("token");
    fetch(url, {
        headers:{
            "Content-type":"application/json",
            "Authorization": `Bearer ${token}`
        }
    }).then(respuesta => respuesta.json())
    .then(data => crear_info_local(data))
}

function crear_info_local(data){
    document.getElementById('local_imagen').setAttribute('src',data.imagen);
    document.getElementById('local_servicios').innerHTML = data.servicios;
    document.getElementById('local_titulo').innerHTML = data.nombre;
    document.getElementById('local_horario').innerHTML = `<ion-icon name="time-outline"></ion-icon> ${data.horario}`;
    document.getElementById('local_telefono').innerHTML = `<ion-icon name="call-outline"></ion-icon> ${data.telefono}`;
    document.getElementById('local_direccion').innerHTML = `<ion-icon name="location-outline"></ion-icon> ${data.direccion}`;
    if(map != undefined){
        map.remove();
    }
    map = L.map('map').setView([data.lat, data.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([data.lat, data.lng]).addTo(map)
        .bindPopup(`<strong>${data.nombre}</strong><br />${data.direccion}`)
        .openPopup();
}

document.addEventListener('DOMContentLoaded', function(){
    let router = document.querySelector('ion-router');
    router.addEventListener('ionRouteDidChange', function(e){
        let nav = e.detail;
        let paginas = document.getElementsByTagName('ion-page');
        for(let i=0 ; i<paginas.length; i++){
            paginas[i].style.visibility = "hidden";
        }
        let ion_route = document.querySelectorAll(`[url="${nav.to}"]`)
        let id_pagina = ion_route[0].getAttribute('component');
        let pagina = document.getElementById(id_pagina);
        pagina.style.visibility = "visible";

        if(nav.to == '/locales'){
            listar_locales();
        }
        if(nav.to == '/local'){
            info_local();
        }
    });

    document.getElementById('btn_registro').onclick = function(){
        try{
            const nombre = document.getElementById('inp_nombre').value;
            const apellido = document.getElementById('inp_apellido').value;
            const email = document.getElementById('inp_email').value;
            const sexo = document.getElementById('inp_sexo').value;
            const password = document.getElementById('inp_password2').value;
            const repassword = document.getElementById('inp_repassword').value;
            
            if(!nombre){
                throw 'Nombre requerido para continuar';
            }
            if(password != repassword){
                throw 'Contrase&ntilde;a y repetici&oacute;n no coinciden';
            }
            // otras validaciones...

            //post a API registro de usuario
            const url = 'https://ort-tddm.herokuapp.com/usuarios';
            const datos = {
                "password": password,
                "email": email,
                "nombre": nombre,
                "apellido": apellido,
                "sexo":sexo
            }
            fetch(url, {
                method:'POST',
                body: JSON.stringify(datos),
                headers:{
                    "Content-type":"application/json"
                }
            }).then(respuesta => (respuesta.ok)?respuesta.json():respuesta.json().then(data => Promise.reject(data.error)))
            .then(data => router.push('/'))
            .catch(mensaje => display_toast(mensaje,'Info','primary'))
        }   
        catch(e){
            display_toast(e,'Info','primary');
        }
    }

    document.getElementById('btn_login').onclick = function(){
        const usuario = document.getElementById('inp_usuario').value;
        const password = document.getElementById('inp_password').value;
        try{
            if(!usuario){
                throw 'Usuario requerido';
            }
            if(!password){
                throw 'Contrase&ntilde;a requerida';
            }
            //invocar API de login de usuario.
            const url = 'https://ort-tddm.herokuapp.com/login';
            fetch(url, {
                method:'POST',
                body: JSON.stringify({usuario:usuario,password:password}),
                headers:{
                    "Content-type":"application/json"
                }
            }).then(respuesta => (respuesta.ok)?respuesta.json():respuesta.json().then(data => Promise.reject(data.error)))
            .then(data => login(data, router))
            .catch(mensaje => display_toast(mensaje,'No autorizado','primary'))
            
        }
        catch(e){
            display_toast(e,'Info','primary');
        }
    }
});