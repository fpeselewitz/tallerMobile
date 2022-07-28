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