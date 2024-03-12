const cors = require("cors");
const express = require("express");
const app = express();
const port = 4800;
const fs = require("fs");
app.use(cors());

const crypto = require("crypto");

const dbName = "bookStore";
const books ="books"

// db
var MongoClient = require("mongodb").MongoClient;
// const mongoUrl = "mongodb://localhost:27017"; // local
 const mongoUrl = "mongodb://localhost:27017"; // global 

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const EventEmitter = require("events");
const { group, Console } = require("console");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.setMaxListeners(20);

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/",function(req, res){
    res.end(JSON.stringify({ msg: "hello" }));
})

app.get("/getBooks", function (req, res) {
    try {
     
      const Type = req.query.type;
      if (!Type) {
        res.end(JSON.stringify({ Error: "InValid Data" }));
      } else {
        if (Type === 'book' || Type === "ebook" || Type ==='audiobook' || Type ==="all") {
          let Query ={}

          if (Type != 'all') Query={"type":Type}  

          const client = new MongoClient(mongoUrl, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
          });
  
          client.connect().then((client) => {
            var db = client.db(dbName);
            db.collection(books)
              .find(Query)
              .toArray((err, result) => {
                if (err) {
                  client.close();
                  res.status(500).json({ Error: "Failed to retrieve documents" });
                } else {
                  client.close();
                  if (result.length > 0) {
                    res.end(JSON.stringify({ Success: result }));
                  } else {
                    res.end(
                      JSON.stringify({ Error: "No Book Details Available" })
                    );
                  }
                }
              });
          });
        } else {
          res.end(
            JSON.stringify({ Error: "Invalid Type , Kindly enter valid Type Key." })
          );
        }
      }
    } catch (e) {
      console.log("Error :", e);
      res.end(
        JSON.stringify({
          Error: "An error occurred while processing your request.",
        })
      );
    }
});

app.get("/addBooks", (req, res) => {
  try {
      
      
    const {id ,imgUrl,title,description,author,price,rating,type} = req.query
    console.log(id ,imgUrl,title,description,author,price,rating,type)
    if (!id||!imgUrl||!title||!description||!author||!price||!rating||!type) {
      res.end(JSON.stringify({ Error: "InValid Data" }));
    } else {
      let newData ={
          
          "id": Number(id),
          "imgUrl": imgUrl,
          "title": title,
          "description": description,
          "author": author,
          "price": Number(price),
          "rating": Number(rating),
          "type": type
        }
        console.log(newData,'newdata')
      if (id.length>0 && imgUrl.length>1 && title.length>5 && description.length>10 && author.length>3 &&price.length>2 &&rating.length>0 &&type.length>3) {
        
        const client = new MongoClient(mongoUrl, {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        });

        client.connect().then((client) => {
          var db = client.db(dbName);
          db.collection(books)
            .find({"id":Number(id)})
            .toArray((err, result) => {
              if (err) {
                client.close();
                res.status(500).json({ Error: "Failed to retrieve documents" });
              } else {
                
                if (result.length > 0) {
                  res.end(JSON.stringify({ Error: "Already This Book Is Exist" }));
                  client.close();
                } else {
                  db.collection(books).insertOne(
                      newData,
                      function (err, result) {
                        if (err) {
                          client.close();
                          console.error("Error appending document:", err);
                          res
                            .status(500)
                            .json({ Error: "Failed to append document" });
                        } else {
                          client.close();
                          res.end(JSON.stringify({ Success: result }));
                        }
                      }
                    );
          
                }
              }
            });
        });
      } else {
        res.end(
          JSON.stringify({ Error: "Invalid Query Data." })
        );
      }
    }
  } catch (e) {
    res.end(JSON.stringify(`Error : ${e}`));
  }
});
  
app.get("/updateBook", (req, res) => {
  try {

const {id ,imgUrl,title,description,author,price,rating,type} = req.query
    
if (!id||!imgUrl||!title||!description||!author||!price||!rating||!type) {
  res.end(JSON.stringify({ Error: "InValid Data" }));
} else {
  newData ={
      
      
      "imgUrl": imgUrl,
      "title": title,
      "description": description,
      "author": author,
      "price": Number(price),
      "rating": Number(rating),
      "type": type
    }
    
  if (id.length>0 && imgUrl.length>1 && title.length>5 && description.length>10 && author.length>3 &&price.length>2 &&rating.length>0 &&type.length>3) {
      const client = new MongoClient(mongoUrl, {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        });
        client.connect().then((client) => {
          var db = client.db(dbName);
          db.collection(books).updateOne(
            { "id": Number(id) },
            {
              $set: newData,
            },
            function (err, result) {
              if (err) {
                client.close();
                res.status(500).json({ Error: "Failed to retrieve documents" });
              } else {
                if (result.modifiedCount === 0) {
                  client.close();
                  res.end(JSON.stringify({ Error: "Counld not updated" }));
                } else {
                  client.close();
                  res.end(JSON.stringify({ Success: result }));
                }
              }
            }
          );
        });
  } else {
    res.end(
      JSON.stringify({ Error: "Invalid Query Data." })
    );
  }
}
    
  } catch (e) {
    res.end(JSON.stringify(`Error : ${e}`));
  }
});

app.get("/deleteBook", (req, res) => {
  try {

const {id ,imgUrl,title,description,author,price,rating,type} = req.query
    
if (!id) {
  res.end(JSON.stringify({ Error: "InValid Data" }));
} else {
  
  
  if (id.length>0 ) {
      const client = new MongoClient(mongoUrl, {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        });
        client.connect().then((client) => {
          var db = client.db(dbName);
          db.collection(books).deleteOne(
            { "id": Number(id) },
            function (err, result) {
              if (err) {
                client.close();
                res.status(500).json({ Error: "Failed to retrieve documents" });
              } else {
                if (result.deletedCount === 0) {
                  client.close();
                  res.end(JSON.stringify({ Error: "Counld not delete" }));
                } else {
                  client.close();
                  res.end(JSON.stringify({ Success: result }));
                }
              }
            }
          );
        });
  } else {
    res.end(
      JSON.stringify({ Error: "Invalid Query Data." })
    );
  }
}
    
  } catch (e) {
    res.end(JSON.stringify(`Error : ${e}`));
  }
});

app.listen(port, () => {
  console.log(`Your Port Number is ${port}`);
});