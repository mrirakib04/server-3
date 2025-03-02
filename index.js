import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3030;
const app = express();

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());
// jwt verification
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req.headers.authorization;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_ACCESS}@cluster0.bfqzn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );

    // Connections
    const database = client.db("hr3_management");
    const usersCollection = database.collection("users");
    const hrsCollection = database.collection("hrs");
    const employeesCollection = database.collection("unemployed");
    const assignedCollection = database.collection("assigned");
    const teamsCollection = database.collection("teams");
    const paymentsCollection = database.collection("payments");
    const assetsCollection = database.collection("assets");
    const requestsCollection = database.collection("requests");
    const pendingCollection = database.collection("pending");

    // jwt
    // jwt related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("HR3 Managements server");
});

app.listen(port, () => {
  console.log(`HR3 Managements server listening on port ${port}`);
});
