import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3030;
const app = express();

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// jwt verification
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
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
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "None",
          maxAge: 60 * 60 * 1000,
        })
        .send({ success: true });
    });
    app.post("/logout", async (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "None",
        })
        .send({ success: true });
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
      const query = { owner: email };
      const result = await assetsCollection
        .find(query)
        .sort({ quantity: 1 })
        .limit(8)
        .toArray();
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
    // asset requests
    app.get("/asset/requests/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = requestsCollection.find({
        requestByEmail: email,
      });
      const result = await cursor.toArray();
      res.send(result);
    });
    // monthly requests
    app.get("/monthly/requests/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = requestsCollection.find({
        requestByEmail: email,
      });
      const result = await cursor.toArray();
      // filtering
      const currentMonth = moment().format("MM");
      const currentYear = moment().format("YYYY");
      const filteredRequests = result.filter((request) => {
        if (!request.requestDate) return false;
        const date = moment(request.requestDate, "DD-MM-YYYY hh:mma");
        return (
          date.isValid() &&
          date.format("MM") === currentMonth &&
          date.format("YYYY") === currentYear
        );
      });
      res.send(filteredRequests);
    });
    // returnable and non-returnable requests
    app.get("/hr/chart/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = requestsCollection.find({
        requestFor: email,
      });
      const result = await cursor.toArray();
      const ReturnableReqests = result.filter(
        (requests) => requests.type === "returnable"
      );
      const NonReturnableReqests = result.filter(
        (requests) => requests.type === "non-returnable"
      );
      const RequestsForChart = [
        { reqsType: "returnable", quantity: ReturnableReqests?.length },
        { reqsType: "non-returnable", quantity: NonReturnableReqests?.length },
      ];
      res.send(RequestsForChart);
    });
    // top requested assets
    app.get("/top/requested/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = requestsCollection.aggregate([
        {
          $match: {
            requestFor: email,
          },
        },
        {
          $group: {
            _id: { name: "$name", type: "$type" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 4,
        },
        {
          $project: {
            _id: 0,
            name: "$_id.name",
            type: "$_id.type",
            count: 1,
          },
        },
      ]);
      const result = await cursor.toArray();
      res.send(result);
    });

    // posting
    // users
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });
    // hrs
    app.post("/hrs", async (req, res) => {
      const newHR = req.body;
      const result = await hrsCollection.insertOne(newHR);
      res.send(result);
    });
    // unemployed
    app.post("/unemployed", async (req, res) => {
      const newEmployee = req.body;
      const result = await employeesCollection.insertOne(newEmployee);
      res.send(result);
    });
    // assigned
    app.post("/assigned", async (req, res) => {
      const assignedEmployee = req.body;
      const result = await assignedCollection.insertOne(assignedEmployee);
      res.send(result);
    });
    // team
    app.post("/team", async (req, res) => {
      const addEmployeeInTeam = req.body;
      const result = await teamsCollection.insertOne(addEmployeeInTeam);
      res.send(result);
    });
    // payments
    app.post("/payments", verifyToken, async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentsCollection.insertOne(payment);
      res.send(paymentResult);
    });
    // assets
    app.post("/assets", async (req, res) => {
      const asset = req.body;
      const result = await assetsCollection.insertOne(asset);
      res.send(result);
    });
    // requests
    app.post("/requests", async (req, res) => {
      const reqDoc = req.body;
      const result = await requestsCollection.insertOne(reqDoc);
      res.send(result);
    });
    // pending
    app.post("/pending", async (req, res) => {
      const reqDoc = req.body;
      const result = await pendingCollection.insertOne(reqDoc);
      res.send(result);
    });

    // updating
    // hr-payment-status
    app.patch("/hr/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          paymentStatus: "paid", // Update payment status to "paid"
        },
      };
      const result = await hrsCollection.updateOne(filter, updateDoc);
      console.log(result);
      if (result.modifiedCount > 0) {
        res.send({ message: "Payment successful." });
      }
    });
    // hr-limit-increasement
    app.patch("/hr/limit/:email", async (req, res) => {
      const email = req.params.email;
      const value = req.body.packageName;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          packageName: value, // Update limit
        },
      };
      const result = await hrsCollection.updateOne(filter, updateDoc);
      console.log(result);
      if (result.modifiedCount > 0) {
        res.send({ message: "Payment successful." });
      }
    });
    // request-approve-status
    app.patch("/request/approve/:id", async (req, res) => {
      const id = req.params.id;
      const approveDate = req.body.approveDate;
      const filter = { assetId: id, status: "pending" };
      const updateDoc = {
        $set: {
          status: "approved", // Update status
          approveDate: approveDate, // Update approveDate
        },
      };
      const result = await requestsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // request-reject-status
    app.patch("/request/reject", async (req, res) => {
      const id = req.query.query;
      const approveDate = req.body.approveDate;
      const filter = { assetId: id, status: "pending" };
      const updateDoc = {
        $set: {
          status: "rejected", // Update status
          approveDate: approveDate, // Update approveDate
        },
      };
      const result = await requestsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // asset-quantity
    app.patch("/quantity/update/:id", async (req, res) => {
      const id = req.params.id;
      const value = req.body.quantity;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          quantity: value, // Update quantity
        },
      };
      const result = await assetsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // asset
    app.put("/update/asset/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid asset ID format" });
      }
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedAsset = {
        $set: req.body,
      };
      const result = await assetsCollection.updateOne(
        filter,
        updatedAsset,
        options
      );
      res.send(result);
    });

    // deleting
    // unemployed
    app.delete("/unemployed/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await employeesCollection.deleteOne(query);
      res.send(result);
    });
    // assigned
    app.delete("/assigned/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await assignedCollection.deleteOne(query);
      res.send(result);
    });
    // team
    app.delete("/team/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await teamsCollection.deleteOne(query);
      res.send(result);
    });
    // asset
    app.delete("/asset/delete", async (req, res) => {
      const reqQuery = req.query.query;
      const query = { _id: new ObjectId(reqQuery) };
      const result = await assetsCollection.deleteOne(query);
      res.send(result);
    });
    // request
    app.delete("/request/delete", async (req, res) => {
      const reqQuery = req.query.query;
      const query = { assetId: reqQuery, status: "pending" };
      const result = await requestsCollection.deleteOne(query);
      res.send(result);
    });
    // return
    app.delete("/request/return/delete", async (req, res) => {
      const reqQuery = req.query.query;
      const query = { _id: new ObjectId(reqQuery) };
      const result = await requestsCollection.deleteOne(query);
      res.send(result);
    });
    // pending
    app.delete("/pending/delete", async (req, res) => {
      const reqQuery = req.query.query;
      const query = { assetId: reqQuery, status: "pending" };
      const result = await pendingCollection.deleteOne(query);
      res.send(result);
    });
    // waiting
    app.delete("/pending/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await pendingCollection.deleteOne(query);
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
