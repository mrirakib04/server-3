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

    // Reading
    // users
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    // unemployed
    app.get("/unemployed", async (req, res) => {
      const cursor = employeesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // assigned
    app.get("/assigned", async (req, res) => {
      const cursor = assignedCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // hrs
    app.get("/hrs", async (req, res) => {
      const cursor = hrsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // hr
    app.get("/hr/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await hrsCollection.findOne(query);
      res.send(result);
    });
    // team
    app.get("/team/:email", async (req, res) => {
      const email = req.params.email;
      const query = { hiredBy: email };
      const result = await teamsCollection.find(query).toArray();
      res.send(result);
    });
    // payments
    app.get("/payments", async (req, res) => {
      const cursor = paymentsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // all assets
    app.get("/assets/all/:email", async (req, res) => {
      const email = req.params.email;
      const query = { owner: email };
      const result = await assetsCollection.find(query).toArray();
      res.send(result);
    });
    // quantity assets
    app.get("/assets/quantity/:email", async (req, res) => {
      const email = req.params.email;
      const query = { owner: email };
      const result = await assetsCollection
        .find(query)
        .sort({ quantity: 1 })
        .toArray();
      res.send(result);
    });
    // search asset
    app.get("/asset/search/:email", async (req, res) => {
      const email = req.params.email;
      const query = req.query.query;
      const regex = new RegExp(query, "i");
      const cursor = assetsCollection.find({
        name: regex,
        owner: email,
      });
      const result = await cursor.toArray();
      res.send(result);
    });
    // asset
    app.get("/asset/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assetsCollection.findOne(query);
      res.send(result);
    });
    // limited assets
    app.get("/assets/limited", async (req, res) => {
      const email = req.query.query;
      const query = { owner: email, quantity: { $lt: 10 } };
      const result = await assetsCollection.find(query).limit(10).toArray();
      res.send(result);
    });
    // employee
    app.get("/employee/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await assignedCollection.findOne(query);
      res.send(result);
    });
    // team member
    app.get("/team/member/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await teamsCollection.findOne(query);
      res.send(result);
    });
    // pending requests
    app.get("/pending/:email", async (req, res) => {
      const email = req.params.email;
      const query = { requestByEmail: email };
      const result = await pendingCollection.find(query).limit(4).toArray();
      res.send(result);
    });
    // hr pending requests
    app.get("/pending/hr/:email", async (req, res) => {
      const email = req.params.email;
      const query = { requestFor: email };
      const result = await pendingCollection.find(query).toArray();
      res.send(result);
    });
    // search pending request
    app.get("/pending/search/:email", async (req, res) => {
      const email = req.params.email;
      const query = req.query.query;
      const regex = new RegExp(query, "i");
      const cursor = pendingCollection.find({
        name: regex,
        requestFor: email,
      });
      const result = await cursor.toArray();
      res.send(result);
    });
    // limited pending requests
    app.get("/pending/recent/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = pendingCollection.find({
        requestFor: email,
      });
      const result = await cursor.limit(4).toArray();
      res.send(result);
    });
    // search pending request
    app.get("/pending/request/search/:email", async (req, res) => {
      const email = req.params.email;
      const query = req.query.query;
      const regex = new RegExp(query, "i");
      const cursor = pendingCollection.find({
        requestFor: email,
        $or: [{ requestByName: regex }, { requestByEmail: regex }],
      });
      const result = await cursor.toArray();
      res.send(result);
    });
    // search asset request user
    app.get("/asset/request/search/:email", async (req, res) => {
      const email = req.params.email;
      const query = req.query.query;
      const regex = new RegExp(query, "i");
      const cursor = requestsCollection.find({
        requestByEmail: email,
        name: regex,
      });
      const result = await cursor.toArray();
      res.send(result);
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
