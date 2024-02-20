const express=require ('express')
const app = express()
const handlebars = require('express-handlebars')
const session = require('express-session')
const bodyParser = require('body-parser')
const flash = require('connect-flash')

// URL JokeAPI
const apiUrlJoke = 'https://v2.jokeapi.dev/joke/Any?lang=es&format=txt';
// URL JokeAPI
const apiUrlImg = 'https://pic.re/image.json';
// URL JokeAPI
const apiUrlDog = 'https://random.dog/woof.json';

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');

//simulacion de bd
const users = {};

//middlewares

//middleware use the material of public folder
app.use(express.static('public'));

//middleware save the session (cookie)
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}))

//middleware initialize flash
app.use(flash());

//middleware urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//middleware to get flash message in the views
app.use((req, res, next) =>{
    const original = res.render;
    res.render = function (view, options, fn){
        options = options || {};
        options.info = req.flash('info');
        options.error = req.flash('error');
        original.call(this, view, options, fn);
    }
    next();
})

/**
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * Este middleware verifica si el usuario esta logueado.
 * Si lo está, permite el acceso a la ruta.
 * Si no lo está, redirecciona a la ruta de login
 */

//middleware in to const protect, see the user is in the system
const protect = (req,res,next) => {
    if(req.session.username){
        next();
    }else{
        req.flash('error', 'You must be logged in to see this page');
        res.redirect('/login');
    }
}
/**
 * @param {*} havePlans
 * middleware que te dice si el usuario tiene plan o no
 */
//middleware chek the plan
const havePlans = (req,res,next) => {
    const user = users[req.session.username];
    if(user.plan == 'none'){
        next();
    }else{
        res.redirect('/');
    }
}

/**
 * @param {*} getJoke
 * funcion Api de chiste que recoge la url de la api chiste y lo exporta
 */
//functions call API
//get a joke
async function getJoke() {
    try {
        const response = await fetch(apiUrlJoke);
        if (!response.ok) {
            throw new Error(`Error al obtener los datos. Código de estado: ${response.status}`);
        }
        const joke = await response.text();
        console.log('Chiste obtenido:');
        console.log(joke);
        return joke;
    } catch (error) {
        console.error('Error:', error.message);
        return ''; // return a empty string in error case
    }
}
/**
 * @param {*} getUrlImage
 * Recoge una imagen de una api de perros y la exporta
 */
//get a image a dog
async function getUrlImage() {
    try {
        const response = await fetch(apiUrlDog);
        if (!response.ok) {
            throw new Error(`Error al obtener los datos. Código de estado: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error.message);
        return ''; // return a empty string in error case
    }
}
/**
 * @param {*} getUrlImgGirl
 * Esta funcion devueve una imagen de una api que devuelve imagenes de chicas anime
 */
//get image anime girl
async function getUrlImgGirl() {
    try {
        const response = await fetch(apiUrlImg);
        if (!response.ok) {
            throw new Error(`Error al obtener los datos. Código de estado: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error.message);
        return ''; // return a empty string in error case
    }
}
//gets
//main getter '/'
//Main rute
app.get('/', protect, async (req, res) => {
    const user = users[req.session.username];
    let jokeText = '';
    let img = '';

    if (user.plan === 'basic') {
        jokeText = await getJoke();
        res.render('index', { joke: jokeText });
    } else if (user.plan === 'premium') {
        jokeText = await getJoke();
        img = await getUrlImage();
        res.render('index', { joke: jokeText, img: img});
    } else if (user.plan === 'ultimate') {
        jokeText = await getJoke();
        img = await getUrlImage();
        imgAnime = await getUrlImgGirl();
        res.render('index', { joke: jokeText, img: img, imgAnime: imgAnime.file_url});
    }
   
});

/**
 * @param {*} getlogin
 * El login te logea si esta el usuario en la bbdd
 */

//render the login view
app.get('/login', (req, res) => {
    const { username } = req.body
    if (req.session.username === username) {
      res.render('login')
    } else {
      res.redirect('/')
    }
  })
//render the register view
app.get('/register', (req, res) => {
    res.render('register')
})


/**
 * @param {*} postlogin
 * verifica el login usuario en la bbdd
 */
//posts

//login post verify the users avaible in database
app.post('/login',(req,res)=>{
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        req.session.username = username;
        res.redirect('/');
    } else {
        req.flash('error', 'Invalid username o password');
        res.redirect('/login');
    }
});
/**
 * @param {*} postregister
 * El post de register registra los datos en la bbdd y verifica que no esten en blanco los datos
 */
//register post verify the users don't repeat in database
app.post('/register',(req,res)=>{
    const { username, password, passwordRepeat } = req.body;
    if(users[username]){
        req.flash('error', 'User already registered');
        res.redirect('/register');
        return;
    } else{
        if(username == ""){
            req.flash('error','The user is empty');
            res.redirect('/register');
            return;
        }
        if(password == ""){
            req.flash('error','The password is empty');
            res.redirect('/register');
            return;
        }
        if(password != passwordRepeat){
            req.flash('error','The password do not match');
            res.redirect('/register');
            return;
        }
    }
    users[username] = {
        username,
        password,
        plan:"none"
    }
    req.flash('info', 'Registration succesful');
    req.session.username = username;
    res.redirect('/getPlan');
});

//render the plans if the user not content "plans"
app.get('/getPlan', protect, (req,res) =>{
    res.render("plans");
});


/**
 * @param {*} basic
 * El plan basic muestra un chiste
 */

app.get('/basic',protect,havePlans,(req,res)=>{
    const user = users[req.session.username];
    if(user.plan == 'none'){
        user.plan = 'basic';
        req.session.plan = "basic";
        users[req.session.username] = user;
    }
    res.redirect('/');
});
/**
 * @param {*} premium
 * El plan premium muestra un chiste y una imagen de un perro
 */
app.get('/premium',protect,havePlans,(req,res)=>{
    const user = users[req.session.username];
    if(user.plan == 'none'){
        user.plan = 'premium';
        req.session.plan = "premium";
        users[req.session.username] = user;
    }
    res.redirect('/')
});
/**
 * @param {*} ultimate
 * El plan ultimate muestra un chiste,  una imagen de un perro y una imagen de una chica anime
 */
app.get('/ultimate',protect,havePlans,(req,res)=>{
    const user = users[req.session.username];
    if(user.plan == 'none'){
        user.plan = 'ultimate';
        req.session.plan = "ultimate";
        users[req.session.username] = user;
    }
    res.redirect('/')
});
/**
 * @param {*} getlogout
 * El logout destruye las sesiones es decir se "deslogea"
 */
//if you go to logout session destroy
app.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/');
})

module.exports = app