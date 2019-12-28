const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const jwtSecret = "49706882136742404976kfjdhvjkf9327169500";

const PASSWORD_REGEX = /^(?=.{8,12}$)(?!.*(\S)\1{2})(?=.*[A-Z])(?=.*[a-z]{3})(?=.*\d)(?=.*[^a-zA-Z0-9])([a-zA-Z]\S*)$/i;
const JMBG_REGEX = /^\d{13}$/i;
const EMAIL_REGEX = /(^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$)/i;

let validateEmail = function(email) {
    return EMAIL_REGEX.test(email)
};

let validatePassword = function(password) {
    return PASSWORD_REGEX.test(password)
};

// let validateJMBG = function(jmbg) {
//     return JMBG_REGEX.test(jmbg)
// };

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    email: {
        type: String,
        required: true,
        minLength: 1,
        trim: true,
        unique: true,
        validate: [validateEmail, 'Invalid email'],
        match: [EMAIL_REGEX, 'Invalid email']
    },
    profession: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    username: {
        type: String,
        required: true,
        minLength: 3,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        validate: [validatePassword, 'Invalid password'],
        match: [PASSWORD_REGEX, 'Invalid password']
    },
    gender: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    jmbg: {
        type: String,
        required: true,
        length: 13,
        trim: true,
        // validate: [validateJMBG, 'Invalid jmbg'],
        // match: [PASSWORD_REGEX, 'Invalid jmbg']
    },
    imgPath: {
        type: String,
        required: true,
        trim: true
    },
    securityQuestion: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    securityAnswer: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    verified: {
        type: Boolean,
        required: true
    },
    rejected: {
        type: Boolean,
        required: true,
        default: false
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
    sessions: [{
        token: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }],
    games: [{
        date: {
            type: String,
            required: true,
        },
        played: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            required: true
        },
        anagram: {
            type: Number,
            required: true
        },
        game5x5: {
            type: Number,
            required: true
        },
        myNumber: {
            type: Number,
            required: true
        },
        geography: {
            type: Number,
            required: true
        },
        goblet: {
            type: Number,
            required: true
        }
    }]
});

//Instance methods
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    //return document except the password and sessions 
    return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        //create json web token and return it
        jwt.sign({ _id: user._id.toHexString() }, jwtSecret,{ expiresIn: "15m" }, (err, token) => {
            if(!err){
                resolve(token);
            } else {
                reject();
            }
        })
    })
}

UserSchema.methods.generateRefreshAuthToken = function() {
    //generate a 64byte hex string 
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if(!err){
                let token = buf.toString('hex');
                return resolve(token);
            }
        })
    })
}

UserSchema.methods.createSession = function() {
    let user = this;
    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        //store to db return token
        return refreshToken;
    }).catch((e) => {
        return Promise.reject("Failed to save session to database.\n", e);
    });
}

//model methods
UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}

UserSchema.statics.getEmailRegex = () => {
    return EMAIL_REGEX;
}

UserSchema.statics.getPasswordRegex = () => {
    return PASSWORD_REGEX;
}

UserSchema.statics.getJMBGRegex = () => {
    return JMBG_REGEX;
}

UserSchema.statics.findByIdAndToken = function(_id, token) {
    const User = this;
    return User.findOne({
        _id,
        'sessions.token': token
    });
}

UserSchema.statics.findByCredentials = function(email, password) {
    const User = this;
    return User.findOne({ email }).then((user) => {
        if(!user){
            return Promise.reject("Couldn't find a user with those credentials.");
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res){
                    resolve(user);
                } else {
                    reject("Couldn't find a user with those credentials.");
                }
            })
        })
    })
}

UserSchema.statics.forgotPassword = function(username, jmbg) {
    const User = this;
    return User.findOne({ username, jmbg }).then((user) => {
        if(!user){
            return Promise.reject("Couldn't find a user with those credentials.");
        }
        return new Promise((resolve) => {
            resolve(user);
        });
    })
}
UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let seccondsSinceEpoch = Date.now()/1000;
    if(expiresAt > seccondsSinceEpoch){
        return false;
    } else {
        return true;
    }
}

//middleware

UserSchema.pre('save', function(next){
    let user = this;
    let costFactor = 10;
    if(user.isModified('password')){
        //if pass is edited run this
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

//helper methods
let saveSessionToDatabase = (user, refreshToken) => {
    return new Promise((resolve, reject) => {
        //save session to db
        let expiresAt = generateRefreshTokenExpiryTime();
        user.sessions.push({
            'token': refreshToken,
            expiresAt
        });

        User.updateOne({
            _id: user._id
        },{
            $set: user
        }).then(() => {
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        });
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUnitlExpire = "10";
    let seccondsUnitlExpire = ((daysUnitlExpire*24)*60)*60;
    return ((Date.now()/1000)+ seccondsUnitlExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User }