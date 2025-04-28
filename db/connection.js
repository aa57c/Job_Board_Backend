// Module connection to mongoDB database.

const { MongoClient } = require("mongodb");
const Db = process.env.MONGO_URI;
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
// Our database connection
let dbConnection;

module.exports = {
    //Establishes the connection to the mongodb server.
    connectToServer: (callback) =>
    {
        client.connect(function (err,db)
        {
            if(err || !db) 
            {
                return callback(err);
            }

            dbConnection = db.db('mydb');
            console.log('Succesfully connected to Mongodb');
            return callback();
        })
    },

    //Returns the connection
    getDB: () =>
    {
        return dbConnection;
    }
};