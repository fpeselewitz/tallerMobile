var map;
var monedas_actualizadas = [];
var transacciones_actualizadas = [];
const dolar = 41;

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

function resetearForms(){
    console.log('entra a la funcion');
    let inputs = document.querySelectorAll('ion-input');
    inputs.forEach(input => {
        input.value = '';});

    let selects = document.querySelectorAll('ion-select');
    selects.forEach(select => {
        select.value = '';});
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
    .then(data => { monedas_actualizadas=[];
                    monedas_actualizadas= data.monedas;
                    console.log(monedas_actualizadas);
                    listarMonedas(monedas_actualizadas);})
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
          <h3>Cotización actual: USD ${moneda.cotizacion}</h3>
        </ion-label>
      </ion-item>`;
      lista_monedas.innerHTML += item;
    });

}

function listarMonedasTransacciones(){

    let lista_monedas_transac = document.getElementById('select_moneda_transaccion');
    lista_monedas_transac.innerHTML = '';
    let item_moneda = '';
    monedas_actualizadas.forEach(function(moneda){
        item_moneda = `<ion-select-option value="${moneda.id}">
        ${moneda.nombre} - USD ${moneda.cotizacion}</ion-select-option>`;
      lista_monedas_transac.innerHTML += item_moneda;
    })

}

function listarMonedasMisTransacciones(){

    let lista_monedas_transac = document.getElementById('select_moneda_mistransacciones');
    lista_monedas_transac.innerHTML = '';
    let item_moneda = '';
    item_moneda = `<ion-select-option value="0">
    Todas las monedas</ion-select-option>`;
    lista_monedas_transac.innerHTML += item_moneda;
    monedas_actualizadas.forEach(function(moneda){
        item_moneda = `<ion-select-option value="${moneda.id}">
        ${moneda.nombre}</ion-select-option>`;
      lista_monedas_transac.innerHTML += item_moneda;
    })

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

function resultadoTransaccion(data){
    resetearForms();
    const mensaje = `${data.mensaje}.<br/> Codigo de la transaccion: ${data.idTransaccion}`;
    display_toast(mensaje, 'Confirmacion', 'success')
}

function actualizarTransacciones(){

    let lista = document.getElementById('lista_mistransacciones');
    lista.innerHTML = '';

    let card = document.getElementById('card_totales');
    card.innerHTML = '';

    cargando('Cargando transacciones...').then((loading) => {
        loading.present();

    const usuario = localStorage.getItem("usuario");
    usuarioObj = JSON.parse(usuario);
    const id_usuario = usuarioObj.id;
    const url = `https://crypto.develotion.com/transacciones.php?idUsuario=${id_usuario}`;
    const apiKey = localStorage.getItem('token');
    fetch(url, {
        method:'GET',
        headers:{
            "apikey": apiKey,
            "Content-type":"application/json",
        }
    }).then(respuesta => respuesta.json())
    .then(data => {
                    transacciones_actualizadas=[];
                    transacciones_actualizadas= data.transacciones;
                    listarTransacciones(transacciones_actualizadas)
                    mostrarTotalInvertido(transacciones_actualizadas);
    })
    .finally(() => loading.dismiss());
    });

}

function tipoTransaccion(codigo){
    if(codigo == 1) return 'Compra';
    return 'Venta';
}

function listarTransacciones(data, id_moneda = 0){
    let lista = document.getElementById('lista_mistransacciones');
    lista.innerHTML = '';
    let item = '';
    data.forEach(function(transaccion){

    const moneda = monedas_actualizadas.filter(moneda => moneda.id == transaccion.moneda);
    const nombre_moneda = moneda[0].nombre;
    const tipo_transaccion = tipoTransaccion(transaccion.tipo_operacion)
    const monto_transaccion = Number(transaccion.cantidad) * Number(transaccion.valor_actual);
    const id_moneda_transac = transaccion.moneda;

    item = `<ion-item>
    <ion-label>
      <h2><strong>${nombre_moneda}</strong></h2>
      <h3><strong>Tipo de operacion: ${tipo_transaccion}</strong></h3>
      <h3>Cantidad: ${transaccion.cantidad}</h3>
      <h3>Precio transaccionado: USD ${transaccion.valor_actual}</h3>
      <h3><strong>Monto total: USD ${monto_transaccion}</strong></h3>
    </ion-label>
    </ion-item>`;

    if(id_moneda == 0){
        lista.innerHTML += item;
    }
    else if(id_moneda == id_moneda_transac){
        lista.innerHTML += item;
    }
    });

}

function mostrarTotalInvertido(data){
    let total = 0;
    data.forEach(function(transaccion){

        const monto_transaccion = Number(transaccion.cantidad) * Number(transaccion.valor_actual) * dolar;
        const tipo_transaccion = transaccion.tipo_operacion;

        if(tipo_transaccion == 1){
            total += monto_transaccion;
        }
        else if(tipo_transaccion == 2){
            total -= monto_transaccion;
        }
    })

    let card = document.getElementById('card_totales');
    let color;
    if(total >= 0) color = 'success';
    if(total < 0) color = 'danger'

    card.innerHTML = `<ion-card-header>
      <ion-card-subtitle>MI TOTAL INVERTIDO</ion-card-subtitle>
      <ion-card-title color="${color}">UYU ${total}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      El calculo se realiza sumando todas las compras y restando todas las ventas.
      El valor se expresa en pesos uruguayos.
    </ion-card-content>`

   
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
            resetearForms();
        }

        if(nav.to == '/monedas'){
            actualizarMonedas();
        }

        if(nav.to == '/transacciones'){
            listarMonedasTransacciones();
            resetearForms();
        }

        if(nav.to == '/mistransacciones'){
            listarMonedasMisTransacciones();
            actualizarTransacciones();
        }

        if(nav.to == '/totales'){
            actualizarTransacciones();
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

    document.getElementById('btn_transaccion').onclick = function(){
        const tipo_transaccion = document.getElementById('select_tipo_transaccion').value;
        const id_moneda = document.getElementById('select_moneda_transaccion').value;
        const cantidad = Number(document.getElementById('inp_cantidad_transaccion').value);
        const usuario = localStorage.getItem("usuario");
        usuarioObj = JSON.parse(usuario);
        const id_usuario = usuarioObj.id;

        try{
            if(!tipo_transaccion){
                throw 'Ingrese tipo de transaccion';
            }
            if(!id_moneda){
                throw 'Ingrese moneda';
            }
            if(!cantidad){
                throw 'Ingrese cantidad'
            }
            if(!Number.isInteger(cantidad) || cantidad < 1){
                throw 'La cantidad debe ser un entero positivo'
            }
            //obtener moneda del array
            const moneda = monedas_actualizadas.filter(moneda => moneda.id == id_moneda);
            const cotizacion = moneda[0].cotizacion;

            cargando('Procesando transaccion...').then((loading) => {
                loading.present();

            //invocar API de login de usuario.
            const url = 'https://crypto.develotion.com/transacciones.php';
            const apiKey = localStorage.getItem('token');
            const datos = {

                "idUsuario": id_usuario,
                "tipoOperacion": tipo_transaccion,
                "moneda": id_moneda,
                "cantidad": cantidad,
                "valorActual": cotizacion
                
            }
            fetch(url, {
                method:'POST',
                body: JSON.stringify(datos),
                headers:{
                    "apikey": apiKey,
                    "Content-type":"application/json",
                }
            }).then(respuesta => (respuesta.ok)?respuesta.json():respuesta.json().then(data => Promise.reject(data.mensaje)))
            .then(data => resultadoTransaccion(data))
            .catch(mensaje => display_toast(mensaje,'No autorizado','primary')).finally(() => loading.dismiss());
        });
            
        }
        catch(e){
            display_toast(e,'Info','primary');
        }

    }

    let filtro_mistransacciones = document.querySelector('#select_moneda_mistransacciones');
    filtro_mistransacciones.addEventListener('ionChange', e => {
        if(e.detail.value){
            const id_moneda = e.detail.value;
            listarTransacciones(transacciones_actualizadas, id_moneda);
        }
    })


});