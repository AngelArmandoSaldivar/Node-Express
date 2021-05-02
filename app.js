const { response } = require('express');
const dbDebug = require('debug')('app:db');//Debug al momento de iniciar necesita que se le envie un parametro en este caso app:db
const config = require('config');//Permite manejar variables globales o una configuración global para un entorno ya sea para prueba o producción
const inicioDegug = require('debug')('app:inicio');//Debug al momento de iniciar necesita que se le envie un parametro en este caso app:inicio
const express = require('express');
const morgan = require('morgan');
const app = express();
const Joi = require('joi');

//Variable de entorno que cambia a producción o variables de desarrollo. (SET NODE_ENV=development) se debe estar en consola como
//admin para realizar el cambio. 




/* const logger = require('./logger'); */
//Middlewares
app.use(express.json());//body
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'));

//Configuración de entornos
console.log('Aplicación: ' + config.get('nombre'));
console.log('Base de datos server: ' + config.get('configDB.host'));

//Uso de middleware de terceros - Morgan
//Morgan imprime la url y le da formato mandando la url el codigo de respuesta y el tiempo que tardo la respuesta


if(app.get('env') === 'development') {//Funcionara si se esta en un entorno de desarrollo

app.use(morgan('tiny'));
console.log('Morgan habilitado');
inicioDegug('Morgan esta habilitado');

}

//Trabajos con base de datos
dbDebug('Conectando con la bd...');


/* app.use(function(req, res, next) {
    console.log('Logging...');
    next();
}) */

/* app.use(logger); */


const usuarios = [

    {id: 1, nombre: 'Angel'},
    {id: 2, nombre: 'Leonardo'},
    {id: 3, nombre: 'Toño'}

];

app.get('/', (req, res) => {
     res.send('Hola mundo desde Express');
}); //Petición 

app.get('/api/usuarios/', (req, res) => {
    res.send(usuarios);
});

app.get('/api/usuarios/:id', (req, res) => {
   let usuario = usuarioExistente(req.params.id)
   if(!usuario) res.status(404).send('El usuario no fue encontrado');
   res.send(usuario);
});

app.post('/api/usuarios', (req, res) => {

    const schema = Joi.object({
        nombre: Joi.string().min(3).required(),
    });

    const {error, value}= validarUsuario(req.body.nombre);

    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
    
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const msg = error.details[0].message;
        res.status(400).send(msg)
    }    



    /* if(!req.body.nombre || req.body.nombre.length <= 2){
        //400 Bad request
        res.status(400).send('Debe ingresar un nombre que tenga minimo tres letras');
        //Con el return termina el proceso y ya no se crea el usuario vacio
        return;
    }

    */

});

app.put('/api/usuarios/:id', (req, res) => {
    
    let usuario = usuarioExistente(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 

    const {error, value}= validarUsuario(req.body.nombre) ;

    if(error){
        const msg = error.details[0].message;
        res.status(400).send(msg);
        return;
    }
    
    usuario.nombre = value.nombre;
    res.send(usuario)

});

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = usuarioExistente(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no fue encontrado');
        return;
    } 

    const index = usuarios.indexOf(usuario);

    usuarios.splice(index, 1);

    res.send(usuario);

});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listen on Port ${port}...`);
});


//Validaciones
function usuarioExistente(id) {
    //Encontrar si existe el objeto usuario 
    return usuarios.find(u  => u.id === parseInt(id));
}
function validarUsuario (nom) {
    
    const schema = Joi.object({
        nombre: Joi.string().min(3).required(),
    });
    return(schema.validate({ nombre: nom}));
    
}


//Antes de hacer el repositorio en Git se tienen que configurar 2 variables siguientes
//git config --global user.name = "Angel Saldivar"
//git config --global user.email = "ang.arm.saldivar@gmail.com"
//git init - Para que git cree nuestro repositorio de esta carpeta s
