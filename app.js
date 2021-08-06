const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
// const items = ["Buy Food","Cook Food","Eat Food"];
// const workItems = [];
mongoose.connect('mongodb+srv://Shinchan123:Shinchan123@cluster0.61awt.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const itemsSchema = new mongoose.Schema({
name:String
});
  const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"Hey,Welcome to your tod-do list"
});
const item2 = new Item({
  name:"Hit the + button to add a new item"
});
const item3 = new Item({
  name:"<--Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/",function(req,res){

  Item.find({},function(err,items){
if(items.length === 0){
  Item.insertMany(defaultItems,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("succesful");
    }
  });
  res.redirect("/");
}
else{
  res.render("list", {
    ListTitle: "Today", newListItems: items
  });
}

 });
 });

 app.get("/:customListName", function(req, res){
   const customListName = _.capitalize(req.params.customListName);

   List.findOne({name: customListName}, function(err, foundList){
     if (!err){
       if (!foundList){
         //Create a new list
         const list = new List({
           name: customListName,
           items: defaultItems
         });
         list.save();
         res.redirect("/" + customListName);
       } else {
         //Show an existing list

         res.render("list", {ListTitle: foundList.name, newListItems: foundList.items});
       }
     }
   });



 });


app.post("/",function(req,res){
  const itemName = req.body.newItem;
    const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if (listName === "Today"){
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(port,function(){
  console.log("server started on port 3000");
});
