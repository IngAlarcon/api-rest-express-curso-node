//Inicimoas el requirimiento de express para poder usarlo, trabajar dentro de nuetra aplicacion
const inicioDebug = require('debug')('app:inicio');//Entorno de depuracion para mi aplicacion
const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
const logger = require('./logger');//importando middleware
const morgan = require('morgan');// Middleware de tercero (no es de expresss)
const Joi = require('joi');//Requiriendo joi para hacer la validaciones
const app =  express();//Crando una instancia de express

//Uso de un middleware para hacer peticiones de tipo post, de formato json
app.use(express.json());// funcion que me permite recibir formato de tipo json
//estamos diciendo que express maneje datos de tipo json
app.use(express.urlencoded({extended:true}));//middleware para hacer peticiones de tipo post, de formato formulario
//no en dato json
/***********MIDDLEWARE para recusrsos estaticos******/
app.use(express.static('public'));// http://localhost:3000/archivo-statico.txt me mostrara el archivo

//############## Configuracion de Entorno ############################
console.log('Aplicacion: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));



/********Uso de middleware de tercero - Morgan (Captura todas las peticiones http que se usan los emprime en consola )******/
//Registro HTTP request en consola

//haciendo que se ejecute morgan solo en modo desarrollo // app.get('env') me dice en que modo esta mi proyecto 
if (app.get('env') === 'development') {

    app.use(morgan('dev'));//formato por defoul tiny o dev
    //console.log('Morgan habilitado.....(en modo desarrollo)');
    inicioDebug('Morgan esta habilitado.....(en modo desarrollo y Debug)');

}

//****TRabjo con la BASE DE DATOS** */
//utilizando depuracion
dbDebug('.........Conectando con la BD.....');//habilitando con comando en consola set DEBUG=app:inicio o app:* para habilitar todos





/***********Craando un MIDDLEWARE******/
//Funciones middleware 
app.use(function(req, res, next){

    console.log('Logging........');
    next();

});

app.use(function(req, res, next){

    console.log('Autenticando........');
    next();

});

app.use(logger);

//metodos a utilisar en express
        // app.get();//Peticion
        // app.post();//Envio de datos 
        // app.put();//Actualizacion
        // app.delete();//eliminacion 


//Creando mi servidor utilizando get (usando la ruta raiz)
app.get('/', (req, res) => {

    res.send('Conectandome desde Express y usando Nodemon.. Implementando varibles de entorno .');//res--->se da una respuesta send---->enviar
});

// Usamos una ruta espesifica para mostrar usuarios
app.get('/api/usuarios', (req, res) => {
    
    res.send(['Chango','Tekka','Walter']);
});

// Usamos una ruta espesifica para mostrar usuarios y implementar parametros para que express lo identifique uso :
app.get('/api/usuarios/:id', (req, res) => {
    
    res.send(req.params.id);
});//Ejecutar  http://localhost:5000/api/usuarios/15

//Manejo de solicitudes HTTP GET
//Creo data.. en un arreglo creo objetos 
const usuarios = [

    {id:1, nombre:'LordChango'},
    {id:2, nombre:'TekkaLOL'},
    {id:3, nombre:'MustangCOC'}
    
];

const usuariosLOL = [

    {id:1, nombre:'KaipeaLOL'},
    {id:2, nombre:'RaficoLOL'},
    {id:3, nombre:'KunCOC'}
    
];

app.get('/api/jugadores/:id',(req, res) => {

    //Creo variable let uso el arreglo usuarios
    //.find me permite buscar informacion de dentro de un arreglo iterando dentro del mismo, el mismo recibe un parametro
    let usuario = usuarios.find( us => us.id === parseInt(req.params.id));
    if(!usuario) res.status(404).send('El Usuario No fue encontrado');
    res.send(`Jugador N°: `+usuario.id+`<br/> Nombre: `+usuario.nombre);
});

app.get('/api/usuarios/nacimiento/:anio/:mes', (req, res) => {
    
    res.send(req.params);
});//Ejecutar http://localhost:5000/api/usuarios/nacimiento/2002/4

//#######MANEJANDO TIPO DE PETICIONES POST###############
app.post('/api/jugadores', (req, res) => {//Creando mi metodo post
   //Validacion de crear usuario si viene un nombre y el tamaño 
   if(!req.body.nombre || req.body.nombre.length <= 2){//condicion para que venga un nombre y longitud del nombre 

    //400 Bad Request
    res.status(400).send('Debe ingresar un nombre, que tenga minimi 3 letras');
    return;//para detener el proceso si la condicion se cumple

   }
    //vamos a usar el arreglo usuario
    //Aqui estamos creando un usuario nuevo(creando un obejeto)
    const jugador = {
        id: usuarios.length + 1,
        nombre: req.body.nombre
    };
    
    //introduciendo el nuevo usuario en el arreglo
    usuarios.push(jugador);

    res.send(jugador);
})


//#######MANEJANDO TIPO DE PETICIONES POST USANDO LIBRERIA JOI###############
app.post('/api/jugadores-lol', (req, res) => {//Creando mi metodo post

    //De la documentacion npm joi nos basamos para crear un esquema de validacion para usarlo
    const schema = Joi.object({
        nombre: Joi.string() //que sea string
            .min(3) //minimo de caracteres
            .max(6)//maximo de caracteres
            .required()//requerido
    });
    //usando mi esquema de validacion 
        //const result = schema.validate({ nombre: req.body.nombre });
        //console.log(result); //analizo mi respuesta de la consola y realizo una desestructuracion
    //Realizao una desestructuracion para capturar mi erro y valor
    const {error, value} = schema.validate({ nombre: req.body.nombre });
    //analizando si viene error y value
    if (!error) {

        const jugadorLOL = {
            id: usuariosLOL.length + 1,
            nombre: value.nombre
        };
        
        //introduciendo el nuevo usuario en el arreglo
        usuariosLOL.push(jugadorLOL);
    
        res.send(jugadorLOL);
        
    } else {
       //si viene error capturo el mensje para mostrarlo
        const mensajeError = error.details[0].message;
        res.status(400).send(mensajeError);
        
    }

 })



 //############### MANEJO DE SOLICITUDES HTTP PUT ########################
//para mostarar los cambios 
 app.get('/api/jugadores-lol',(req, res) => {

    res.send(usuariosLOL);

});
 
 //Actualizando informacion
 app.put('/api/jugadores-lol/:id', (req, res) => {

    //Encontrar si existe el objeto usuario para actualizarlo
       //let usuariolol = usuariosLOL.find(ulol => ulol.id === parseInt(req.params.id));//sin funcion
    let usuariolol = exiteUsuario(req.params.id);  //usando funcion 
    
       if(!usuariolol){ 
           
         res.status(404).send(`El jugador con el id ${req.params.id} no fue enconrtrado en el arreglo`);
         return; 
        
        }

      //De la documentacion npm joi nos basamos para crear un esquema de validacion para usarlo
                //***estas lineas van sin funcion ***/
                // const schema = Joi.object({
                //     nombre: Joi.string() //que sea string
                //         .min(3) //minimo de caracteres
                //         .max(6)//maximo de caracteres
                //         .required()//requerido
                // });
   
                // const {error, value} = schema.validate({ nombre: req.body.nombre });
    
     const {error, value} = validarUsuario(req.body.nombre) ;//USando funcion creada           
    
    //analizando si viene error y value
    if (error) {
         //si viene error capturo el mensje para mostrarlo
         const mensajeError = error.details[0].message;
         res.status(400).send(mensajeError); 
         return;      
    } 

     usuariolol.nombre = value.nombre;
     res.send(usuariolol);


 })


//################# MANEJO DE SOLICITUD HTTP DELETE ############################

app.delete('/api/jugadores-lol/:id', (req, res ) => {
    
    let usuarioBorrar = exiteUsuario(req.params.id);
    if(!usuarioBorrar){
        res.status(404).send(`El Jugador con id:"${req.params.id}" no fue encontrado!!!!`);
        return;
    }

    const idEliminar = usuariosLOL.indexOf(usuarioBorrar);
    usuariosLOL.splice(idEliminar, 1);
    
    res.send(`Se a eliminado con exito al usuario ${idEliminar+1}.`);

});



//Creando variable de entorno
const port = process.env.PORT || 3000;//Variable de entorno del sistema ejecutar en el panel set PORT=5000 para asignar puerto 

//Habilitando puerto (se ejecuta en la consola dentro de la carpeta con node app.js)
        app.listen(port, () => {

            console.log(`Se habilito el puerto ${port} usando nodemon y Varibles de entorno`);
        });



////********Funciones de Validacion para no repetir codigo ******/////

function exiteUsuario(id){

    return( usuariosLOL.find(ulol => ulol.id === parseInt(id)) );
} 

function validarUsuario(nom){

    const schema = Joi.object({
        nombre: Joi.string() //que sea string
            .min(3) //minimo de caracteres
            .max(6)//maximo de caracteres
            .required()//requerido
    });

    return(schema.validate({ nombre: nom }))


}