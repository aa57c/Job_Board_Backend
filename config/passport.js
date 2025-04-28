const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwT = require("passport-jwt").ExtractJwt;
const keys = require("../config/keys");

const opts = {};
opts.jwtFromRequest = ExtractJwT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
    passport.use(
        new JWTStrategy(opts, (jwt_payload, done) => {
            User.findById(jwt_payload.id)
            .then(user => {
              if (user) {
                return done(null, user);
              }
              return done(null, false);
            })
            .catch(err => console.log(err));
        })
    )
}