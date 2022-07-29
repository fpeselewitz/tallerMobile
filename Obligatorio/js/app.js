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

function login(data, usuario, router){
    localStorage.setItem("token", data.apiKey);
    localStorage.setItem("usuario", JSON.stringify(data));
    localStorage.setItem("nombre_usuario", usuario);
    router.push('/monedas');
  
}

async function cargando(message){
    const loading = await loadingController.create({
        message: message,
      });
    return await loading;
}

function actualizarMonedas(){

    let lista_monedas = document.getElementById('lista_monedas');
    lista_monedas.innerHTML = '';

    cargando('Cargando monedas...').then((loading) => {
        loading.present();

    const url = 'https://crypto.develotion.com/monedas.php';
    const apiKey = localStorage.getItem('token');
    fetch(url, {
        method:'GET',
        headers:{
            "apikey": apiKey,
            "Content-type":"application/json",
        }
    }).then(respuesta => respuesta.json())
    .then(data => listarMonedas(data.monedas))
    .finally(() => loading.dismiss());
    });

}

function listarMonedas(data){

    let lista_monedas = document.getElementById('lista_monedas');
    lista_monedas.innerHTML = '';
    let item = '';
    data.forEach(function(moneda){
        item = `<ion-item>
        <ion-avatar slot="start">
          <img src="https://crypto.develotion.com/imgs/${moneda.imagen}"/>
        </ion-avatar>
        <ion-label>
          <h2><strong>${moneda.nombre}</strong></h2>
          <h3>Cotización actual: ${moneda.cotizacion}</h3>
        </ion-label>
      </ion-item>`;
      lista_monedas.innerHTML += item;
    });
    
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

function validarNombreUsuario(nombreUsuario){
    return nombreUsuario.trim().length > 3 && containsChars(nombreUsuario);
}

function validarPassword(password){
    return password.trim().length > 4 && containsNumbers(password) && containsChars(password);

}

function containsNumbers(string){

    for(let i=0; i<string.length; i++){
        let char = string[i];
        if(!isNaN(char)) return true;
    }
    return false;

}

function containsChars(string){

    for(let i=0; i<string.length; i++){
        let char = string[i];
        if(isNaN(char)) return true;
    }
    return false;
}


document.addEventListener('DOMContentLoaded', function(){
    let router = document.querySelector('ion-router');
    router.addEventListener('ionRouteDidChange', function(e){
        menuController.close();
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

        if(nav.to == '/monedas'){

            actualizarMonedas();

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
            
            if(!nombre_usuario){
                throw 'Nombre requerido para continuar';
            }
            if(!validarNombreUsuario(nombre_usuario)){
                throw 'El nombre de usuario debe tener una longitud de al menos 4 caracteres y no puede ser unicamente numeros';
            }
            if(!id_depto){
                throw 'Debe indicar un departamento';
            }
            if(!id_ciudad){
                throw 'Debe indicar una ciudad';
            }
            if(!password){
                throw 'Debe ingresar una contraseña';
            }
            if(!validarPassword(password)){
                throw 'La contraseña debe tener al menos 5 caracteres, y debe contener numeros y letras';
            }
            if(password != repassword){
                throw 'Contrase&ntilde;a y repetici&oacute;n no coinciden';
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
            .catch(mensaje => {display_toast(mensaje,'Info','primary');
                                actualizarPaginaRegistro();})
        }   
        catch(e){
            display_toast(e,'Info','primary');
            actualizarPaginaRegistro();
        }
    }

    document.getElementById('btn_login').onclick = function(){
        const usuario = document.getElementById('login_usuario').value;
        const password = document.getElementById('login_password').value;
        try{
            if(!usuario){
                throw 'Usuario requerido';
            }
            if(!password){
                throw 'Contrase&ntilde;a requerida';
            }
            //invocar API de login de usuario.
            const url = 'https://crypto.develotion.com/login.php';
            fetch(url, {
                method:'POST',
                body: JSON.stringify({usuario:usuario,password:password}),
                headers:{
                    "Content-type":"application/json"
                }
            }).then(respuesta => (respuesta.ok)?respuesta.json():respuesta.json().then(data => Promise.reject(data.mensaje)))
            .then(data => login(data, usuario, router))
            .catch(mensaje => display_toast(mensaje,'No autorizado','primary'))
            
        }
        catch(e){
            display_toast(e,'Info','primary');
        }
    }
});