// Module connection to MongoDB database.

const { MongoClient } = require("mongodb");
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Our database connection
let dbConnection;

module.exports = {
  // Establishes the connection to the MongoDB server.
  connectToServer: async (callback) => {
    try {
      await client.connect();
      dbConnection = client.db('mydb'); // <-- YOUR database name here
      console.log('Successfully connected to MongoDB');
      callback();
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
      callback(err);
    }
  },

  // Returns the connection
  getDB: () => dbConnection,
};
