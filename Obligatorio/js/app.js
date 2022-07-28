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

function actualizarPaginaRegistro(){

    const url_deptos = 'https://crypto.develotion.com/departamentos.php';
    fetch(url_deptos, {
        method:'GET',
        headers:{
            "Content-type":"application/json"
        }
    }).then(respuesta => respuesta.json())
    .then(data => actualizarDesplegableDepartamentos(data.departamentos))

}

function actualizarDesplegableDepartamentos(data){

    let lista_deptos = document.getElementById('select_departamento_registro');
    let item = '';
    data.forEach(function(departamento){
        item = `<ion-select-option value="${departamento.id}">
        ${departamento.nombre}</ion-select-option>`;
      lista_deptos.innerHTML += item;
    })

}

function actualizarDesplegableCiudades(data, id_depto){

    let lista_deptos = document.getElementById('select_ciudad_registro');
    let item = '';
    data.forEach(function(ciudad){
        if(id_depto == ciudad.id_departamento)
        {
            item = `<ion-select-option value="${ciudad.id}">
            ${ciudad.nombre}</ion-select-option>`;
            lista_deptos.innerHTML += item;
        }
    })
}

function actualizarCiudades(id_depto){

    const url = 'https://crypto.develotion.com/ciudades.php';
    fetch(url, {
        method:'GET',
        headers:{
            "Content-type":"application/json"
        }
    }).then(respuesta => respuesta.json())
    .then(data => actualizarDesplegableCiudades(data.ciudades, id_depto))

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

        if(nav.to == '/registro'){
            actualizarPaginaRegistro();
        }

    });

    let lista_deptos = document.querySelector('#select_departamento_registro');
    lista_deptos.addEventListener('ionChange', e => {

        if(e.detail.value){

            console.log('reconoce el cambio y debe actualizar con ' + e.detail.value);
            let lista_ciudades = document.querySelector('#select_ciudad_registro');
            lista_ciudades.innerHTML ='';
            lista_ciudades.disabled = false;
            actualizarCiudades(e.detail.value);
        }

    })
   
    
    document.getElementById('btn_registro').onclick = function(){
        try{
            const nombre_usuario = document.getElementById('inp_nombre_usuario').value;
            const id_ciudad = document.getElementById('select_ciudad_registro').value;
            const id_depto = document.getElementById('select_departamento_registro').value;
            const password = document.getElementById('inp_password2').value;
            const repassword = document.getElementById('inp_repassword').value;

            console.log(nombre_usuario);
            console.log(id_ciudad);
            console.log(id_depto);
            console.log(password);
            console.log(repassword);

            
            if(!nombre_usuario){
                throw 'Nombre requerido para continuar';
            }
            if(password != repassword){
                throw 'Contrase&ntilde;a y repetici&oacute;n no coinciden';
            }
            if(!id_depto){
                throw 'Debe indicar un departamento'
            }
            if(!id_ciudad){
                throw 'Debe indicar una ciudad'
            }

            //post a API registro de usuario
            const url = 'https://crypto.develotion.com/usuarios.php';
            const datos = {
                "usuario": nombre_usuario,
                "password":password,
                "idDepartamento":id_depto,
                "idCiudad": id_ciudad
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