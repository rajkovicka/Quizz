const express = require('express');
const app = express();
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
const bcrypt = require('bcryptjs');
const dateFormatter = require('date-fns/format');
const subDays = require('date-fns/subDays');

const { mongoose } = require('./db/mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  });
var upload = multer({ storage: storage })

const bodyParser = require('body-parser');

//load mongoose models
const { User, Game, Anagram, Game5x5, Goblet, GameOfTheDay, Geography, GeographyRequest } = require('./db/models');

const jwt = require('jsonwebtoken');

//middleware

//load middleware
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id, role");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token, role'
    );

    next();
  });

app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://localhost:3000");
    return next();
});

app.use(express.static(__dirname + '/'));

  //check if req has valid jwt token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    jwt.verify(token, User.getJWTSecret(), (err, decoded) =>{
        if(err){
            res.status(401).send(err);
        } else {
            req.user_id = decoded._id;
            User.findById(req.user_id).then((user) => {
                if(user){
                    req.role = user.role;
                }
            });
            next();
        }
    });
}

//verify refresh token (verify session)
let verifySession = (req,res,next) => {
    let refreshToken = req.header('x-refresh-token');
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) =>{
        if(!user){
            return Promise.reject({
                'error': 'User not found. Make sure that refresh token and user id are correct.'
            });
        }

        //session valid
        req.user_id = user._id;
        req.refreshToken = refreshToken;
        req.userObject = user;
        req.role = user.role;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if(session.token === refreshToken){
                if(User.hasRefreshTokenExpired(session.expiresAt)===false){
                    isSessionValid = true;
                }
            }
        });

        if(isSessionValid){
            next();
        } else{
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }
    }).catch((e) => {
        res.status(401).send(e);
    })
} 

app.post('/users', (req, res) => {
    let body = req.body;

    if(body.role === 'player') {
        body.verified = false;
    }
    body.verified = false;
    body.role = 'player';
    body.rejected = false;
    body.score = 0;
    User.findOne({email: body.email}).then((userByEmail) => {
        if(!userByEmail){
            return true;
        }
        return false;
    }).then((isValid) => {
        if(isValid){
            User.findOne({
                username: body.username
            }).then((userByUsername) => {
                if(!userByUsername){
                    let newUser = new User();
                    newUser.name = body.name;
                    newUser.lastName = body.lastName;
                    newUser.email = body.email;
                    newUser.profession = body.profession;
                    newUser.username = body.username;
                    newUser.password = body.password;
                    newUser.gender = body.gender;
                    newUser.jmbg = body.jmbg;
                    newUser.imgPath = body.imgPath;
                    newUser.securityQuestion = body.securityQuestion;
                    newUser.securityAnswer = body.securityAnswer;
                    newUser.role = 'player';
                    newUser.verified = false;
                    newUser.rejected = false;
                    newUser.score = 0;
                    newUser.sessions = [];
                    newUser.games = [];
                    newUser.save().then(() => {
                        return newUser.createSession();
                    }).then((refreshToken) =>{
                        return newUser.generateAccessAuthToken().then((accessToken) => {
                            return {accessToken, refreshToken};
                        });
                    }).then((authTokens)=> {
                        res
                        .header('x-refresh-token', authTokens.refreshToken)
                        .header('x-access-token', authTokens.accessToken)
                        .header('role', newUser.role)
                        .status(200)
                        .send(newUser);
                    }).catch((e) => {
                        res.status(400).send(e);
                    });
                } else {
                    res.send({message: 'Found a user with that username.'});
                }
            })
        } else {
            res.send({message: 'Found a user with that email.'});
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
})

app.get('/users/top', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'player'){
            return {user, isPlayer: true};
        }
        return {user, isPlayer: false};
    }).then((result) => {
        let { user, isPlayer } = result;
        if(isPlayer) {
            User.find({ role: 'player', verified: true, rejected: false }).sort({ score: -1 }).limit(10).then((users) => {
                res.status(200).send({users: users, user: user});
            }).catch((err) => {
                res.sendStatus(404).send(err);
            });
        } else {
            throw new Error('Error.');
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
})

app.post('/uploadphoto', upload.single('picture'), (req, res) => {
    res.send({ filename: req.file.filename});
});

app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user)=>{
        return user.createSession().then((refreshToken)=>{
            return user.generateAccessAuthToken().then((accessToken)=>{
                return {accessToken, refreshToken};
            });
        }).then((authTokens) => {
            res.header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .header('role', user.role)
            .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})

app.get('/users/forgotPassword', (req, res) => {
    let username = req.query.username;
    let jmbg = req.query.jmbg;

    User.forgotPassword(username, jmbg).then((user) => {
        res.send({ user: user, id: user._id});
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.patch('/users/forgotPassword/:id', (req, res) => {
    let costFactor = 10;
    User.findOne({ securityQuestion: req.body.securityQuestion, securityAnswer: req.body.securityAnswer }).then((user) => {
        if(user){ 
            bcrypt.hash(req.body.password, costFactor, function(err, hash) {
                User.findOneAndUpdate({
                    _id: req.params.id
                },{
                    password: hash
                }).then((user) => {
                    res.status(200).send(user);
                }).catch((err) => {
                    res.status(500).send(err);
                });
            });
        } else {
            res.status(403).send(e);
        }
    }).catch((e) => {
        res.status(403).send(e);
    })
});

app.patch('/users/changePassword', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user){
            if(user.username === req.body.username){
                bcrypt.compare(req.body.password, user.password, (err, r) => {
                    if(r){
                        let costFactor = 10;
                        bcrypt.hash(req.body.newPassword, costFactor, function(err, hash) {
                            User.findOneAndUpdate({
                                _id: req.user_id
                            },{
                                password: hash
                            }).then((u) => {
                                res.status(200).send(u);
                            }).catch((err) => {
                                res.status(500).send(err);
                            });
                        });
                    } else {
                        res.status(400).send({message: "Passwords don't match"});
                    }
                })
            } else {
                res.status(400).send({message: "Username invalid"});
            }
        } else {
            res.status(400).send({message: "User doesn't exist"});
        }
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.patch('/users/verify/:id', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'admin'){
            return true;
        }
        return false;
    }).then((isAdmin) => {
        if(isAdmin){
            User.findById(req.params.id).then((user) => {
                user.verified = true;
                User.updateOne({ 
                    _id: req.params.id
                },{
                    $set: user
                }).then(() => {
                    res.status(200).send({message: "Verified successfully!"});
                });
            })
        } else {
            res.sendStatus(403);
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
})

app.patch('/users/reject/:id', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'admin'){
            return true;
        }
        return false;
    }).then((isAdmin) => {
        if(isAdmin){
            User.findById(req.params.id).then((user) => {
                user.rejected = true;
                User.updateOne({ 
                    _id: req.params.id
                },{
                    $set: user
                }).then(() => {
                    res.status(200).send({message: "Rejected successfully!"});
                });
            })
        } else {
            res.sendStatus(403);
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
})

app.get('/users/me/access-token', verifySession, (req,res) => {
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({accessToken});
    }).catch((e) => {
        res.status(400).send(e);
    });
})

app.get('/users/unverified', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(!user){
            return false;
        }
        let role = user.role;
        if(role !== 'admin'){
            return false;
        }
        return true;
    }).then((isAuthorized) => {
        if(isAuthorized) {
            User.find({
                rejected: false,
                verified: false
            }).then((users) => {
                res.status(200).send({ unverifiedUsers: users });
            })
        } else {
            res.sendStatus(403);
        }
    }).catch((e) => {
        res.status(404).send(e);
    });
});

app.patch('/play', authenticate, (req,res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'player'){
            return true;
        }
        return false;
    }).then((isPlayer) => {
        if(isPlayer) {
            User.findOne({ _id: req.user_id }).then((user) => {
                let i=-1;
                let hasStartedPlaying = false;
                user.games.forEach((game) => {
                    i += 1;
                    if(game.date === req.body.date){
                        hasStartedPlaying = true;
                    }
                })
                if(user.games[i]){
                    user.games[i].played = req.body.played;
                    user.games[i].score = user.games[i].score + req.body.score;
                    user.score = user.score + req.body.score;
                    user.games[i].anagram = user.games[i].anagram + req.body.anagramScore;
                    user.games[i].game5x5 = user.games[i].game5x5 + req.body.game5x5Score;
                    user.games[i].myNumber = user.games[i].myNumber + req.body.myNumberScore;
                    user.games[i].geography = user.games[i].geography + req.body.geographyScore;
                    user.games[i].goblet = user.games[i].goblet + req.body.gobletScore;
                } else {
                    let date = dateFormatter(new Date(), 'yyyy-MM-dd');
                    user.games.push({
                        date: date,
                        score: req.body.score,
                        played: req.body.played,
                        anagram: req.body.anagramScore,
                        game5x5: req.body.game5x5Score,
                        myNumber: req.body.myNumberScore,
                        geography: req.body.geographyScore,
                        goblet: req.body.gobletScore,
                    });
                }
                User.updateOne({ 
                    _id: req.user_id
                },{
                    $set: user
                }).then(() => {
                    if(!hasStartedPlaying) {
                        GameOfTheDay.findOne({ _id: req.body.id }).then((game) => {
                            if(game) {
                                game.numOfPlayers = game.numOfPlayers + 1;
                                GameOfTheDay.updateOne({ 
                                    _id: req.body.id
                                },{
                                    $set: game
                                }).then(() => {
                                    res.status(200).send({message: "Updated successfully!"});
                                })
                            } else {
                                res.status(500).send({message: "Error occured while updating."});
                            }
                        })
                    } else {
                        res.status(200).send({message: "Updated successfully!"});
                    }
                });
            })
        }
    }).catch((e) => {
        res.status(404).send(e);
    });
});

app.get('/games/gamesOfTheDay', authenticate, (req,res) => {
    let body = req.body;
    User.findById(req.user_id).then((user) => {
        if(user.role === 'admin'){
            return true;
        }
        return false;
    }).then((isAdmin) => {
        if(isAdmin){
            GameOfTheDay.find({
                numOfPlayers: 0
            }).then((games) => {
                res.status(200).send({ games: games });
            })
        } else {
            throw new Error('You are not authorized.');
        }
    }).catch((err) => {
        res.status(404).send({message: err});
    });
})

app.get('/games/day', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'player'){
            return true;
        }
        return false;
    }).then((isPlayer) => {
        if(isPlayer){
            let date = dateFormatter(new Date(), 'yyyy-MM-dd');
            GameOfTheDay.findOne({
                date: date
            }).then((game) => {
                res.status(200).send(game);
            })
        } else {
            throw new Error('You are not authorized.');
        }
    }).catch((err) => {
        res.status(404).send({message: err});
    });
})

app.post('/games/addNewGame', authenticate, (req, res) => {
    let body = req.body;
    User.findById(req.user_id).then((user) => {
        if(user.role === 'supervisor'){
            return true;
        }
        return false;
    }).then((isSupervisor) => {
        if(isSupervisor){
            switch(body.type){
                case 'anagram':
                    new Anagram({ question: body.question, answer: body.answer }).save().then(() => {
                        res.status(200).send({message: 'Anagram successfully added!'});
                    }).catch((err) => {
                        res.status(404).send({message: err});
                    });
                    break;
                case 'game5x5':
                    new Game5x5({ words: body.words }).save().then(() => {
                        res.status(200).send({message: 'Game 5x5 successfully added!'});
                    }).catch((err) => {
                        res.status(404).send({message: err});
                    });
                    break;
                case 'goblet':
                    new Goblet({ questions: body.questions, answers: body.answers }).save().then(() => {
                        res.status(200).send({message: 'Goblet game successfully added!'});
                    }).catch((err) => {
                        res.status(404).send({message: err});
                    });
                    break;
                default:
                    res.status(404).send({message: 'Invalid game type.'});
            }
        } else {
            res.status(403).send({message: 'You are not authorized.'});
        }
    }).catch((err) => {
        res.status(404).send({message: err});
    });
});

app.post('/games/addGameOfDay', authenticate, (req, res) => {
    let body = req.body;
    User.findById(req.user_id).then((user) => {
        if(user.role === 'admin'){
            return true;
        }
        return false;
    }).then((isAdmin) => {
        let newGameOfDay = null;
        if(isAdmin){
            newGameOfDay = new GameOfTheDay({ _anagramGameId: body.anagramId, _game5x5GameId: body.game5x5Id, _gobletGameId: body.gobletId, date: body.date })
        } else {
            throw new Error('You are not authorized.');
        }
        return newGameOfDay;
    }).then((game) => {
        if(game){
            GameOfTheDay.find({ date: body.date }).then((foundGame) => {
                if(foundGame.length < 1){
                    game.save();
                    res.status(200).send({ game: game });
                } else {
                    res.status(400).send({ message: "Game already exists." });
                }
            })
        } else {
            res.status(400).send({ message: "Error while adding game." });
        }
    }).catch((err) => {
        res.status(404).send({message: err});
    });
})

app.patch('/games/changeGameOfTheDay/:id', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'admin'){
            return true;
        }
        return false;
    }).then((isAdmin) => {
        if(isAdmin){
            GameOfTheDay.findOne({ _id: req.params.id }).then((game) => {
                if(game.numOfPlayers === 0){
                    game._anagramGameId = req.body._anagramGameId;
                    game._game5x5GameId = req.body._game5x5GameId;
                    game._gobletGameId = req.body._gobletGameId;
                    game.date = req.body.date;
                    GameOfTheDay.updateOne({ 
                        _id: req.params.id
                    },{
                        $set: game
                    }).then(() => {
                        res.status(200).send({message: "Updated successfully!"});
                    });
                } else {
                    res.status(404).send({message: "Game already played by some users."});
                }
            })
        } else {
            res.sendStatus(403);
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
});

app.get('/score', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user){
            let date = dateFormatter(new Date(), 'yyyy-MM-dd');
            let i = 0;
            for(;i<user.games.length;i++){
                if(user.games[i].date === date){
                    break;
                }
            }
            if(user.games[i]){
                res.status(200).send(user.games[i]);
            } else {
                res.sendStatus(404).send();
            }
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
})

app.delete('/geography/:id', authenticate, (req,res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'supervisor'){
            return true;
        }
        return false;
    }).then((isSupervisor) => {
        if(isSupervisor){
            GeographyRequest.findOneAndRemove({_id: req.params.id}).then(() => {
                res.sendStatus(200);
            });
        } else {
            res.status(403).send({ message: 'You are not authorized!' });
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
})

app.patch('/geography/:id', authenticate, (req,res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'supervisor'){
            return true;
        }
        return false;
    }).then((isSupervisor) => {
        if(isSupervisor){
            User.findById(req.body.user_id).then((player) => {
                player.score = player.score + req.body.score;
                player.games[player.games.length-1].score = player.games[player.games.length-1].score + req.body.score; 
                User.updateOne({ 
                    _id: req.body.user_id
                },{
                    $set: player
                }).then(() => {
                    GeographyRequest.findOneAndRemove({_id: req.params.id}).then(() => {
                        res.sendStatus(200);
                    });
                });
            })
        } else {
            res.status(403).send({ message: 'You are not authorized!' });
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
})

app.get('/games', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'admin'){
            return true;
        }
        return false;
    }).then((isAdmin) => {
        if(isAdmin){
            switch(req.query.gameType){
                case 'anagram':
                    Anagram.find().then((anagrams) => {
                         res.status(200).send({games: anagrams});
                     })
                    break;
                case 'game5x5':
                    Game5x5.find().then((games5x5) => {
                        res.status(200).send({games: games5x5});
                    })
                    break;
                case 'goblet':
                    Goblet.find().then((goblets) => {
                        res.status(200).send({games: goblets});
                    })
                    break;
                default:
                    throw new Error('Invalid game type.');
            }
        } else {
            throw new Error('You are not authorized.');
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
});

app.get('/game/:id', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'admin'){
            return true;
        }
        return false;
    }).then((isAdmin) => {
        if(isAdmin){
            GameOfTheDay.findOne({
                _id: req.params.id
            }).then((game) => {
                res.status(200).send(game);
            }).catch((err) => {
                res.status(500).send(err);
            });
        } else {
            throw new Error('You are not authorized.');
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
});

app.get('/geography', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'player'){
            return true;
        }
        return false;
    }).then((isPlayer) => {
        if(isPlayer){
            Geography.find({value:{ $in: req.query.terms.split(',')} }).then((terms) =>{
                scoreTerms = terms.length;
                res.status(200).send({ score: scoreTerms, terms: terms });
            })
        } else {
            throw new Error('You are not authorized.');
        }
    }).catch((err) => {
        res.status(404).send(err);
    });
})

app.post('/geography', (req, res) => {
    const { type, value } = req.body;
    let geography = new Geography({ type: type, value: value });
    geography.save().then((geography) => {
        res.status(200).send({ geography: geography });
    }).catch((e) => {
        res.status(400).send(e);
    });
})

app.post('/geography/requests', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'player'){
            return true;
        }
        return false;
    }).then((isPlayer) => {
        if(isPlayer) {
            let requests = [];
            let i = 0;
            req.body.types.forEach(type => {
                let request = new GeographyRequest({ value: req.body.values[i], type: type, _userId: req.user_id });
                i += 1;
                requests.push(request);
            });
            GeographyRequest.insertMany(requests).then((result) => {
                res.sendStatus(200);
            }).catch((e) => {
                res.status(400).send(e);
            });
        } else {
            throw new Error('You are not authorized.');
        }
    }).catch((e) => {
        res.status(400).send(e);
    });
})

app.get('/geography/requests', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'supervisor'){
            return true;
        }
        return false;
    }).then((isSupervisor) => {
        if(isSupervisor){
            GeographyRequest.find().then((requests) => {
                res.status(200).send({ requests });
            });
        } else {
            throw new Error('You are not authorized.');
        }
    }).catch((e) => {
        res.status(400).send(e);
    });
})

app.get('/games/single', authenticate, (req, res) => {
    User.findById(req.user_id).then((user) => {
        if(user.role === 'player'){
            return true;
        }
        return false;
    }).then((isPlayer) => {
        if(isPlayer){
            switch(req.query.gameType){
                case 'anagram':
                    Anagram.findOne({ _id: req.query.id }).then((anagram) => {
                         res.status(200).send(anagram);
                     })
                    break;
                case 'game5x5':
                    Game5x5.findOne({ _id: req.query.id }).then((game5x5) => {
                        res.status(200).send(game5x5);
                    })
                    break;
                case 'goblet':
                    Goblet.findOne({ _id: req.query.id }).then((goblet) => {
                        res.status(200).send(goblet);
                    })
                    break;
                default:
                    throw new Error('Invalid game type.');
            }
        } else {
            throw new Error('You are not authorized.');
        }
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
})

app.get('/top', (req, res) => {
    User.find({ role: 'player', verified: true, rejected: false }).then((users) => {
        let scores20 = [];
        let scoresMonthly = [];
        let days20 = dateFormatter(subDays(new Date(), 20), 'yyyy-MM-dd');
        let month = dateFormatter(new Date(), 'MM');
        users.forEach((user) => {
            const { games, name, lastName, imgPath } = user;
            let score20 = 0;
            let scoreMonthly = 0;
            games.forEach((game) => {
                const { date, score } = game;
                const m = date.slice(5,7);
                if(date > days20){
                    score20 += score;
                }
                if(m === month){
                    scoreMonthly += score;
                }
            })
            scores20.push({ name: name, lastName: lastName, imgPath: imgPath, score: score20 });
            scoresMonthly.push({ name: name, lastName: lastName, imgPath: imgPath, score: scoreMonthly });
        })
        scores20.sort((a, b) => (a.score > b.score) ? -1 : 1);
        scoresMonthly.sort((a, b) => (a.score > b.score) ? -1 : 1);
        scores20 = scores20.slice(0,10);
        scoresMonthly = scoresMonthly.slice(0,10);
        res.status(200).send({ day: scores20, month: scoresMonthly });
    }).catch((err) => {
        res.sendStatus(404).send(err);
    });
})

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});