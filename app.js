const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const _ =require("lodash")
const date = require(__dirname+"/date.js")

const app = express();

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("Public"))


mongoose.connect("mongodb://localhost:27017/ToDoAppDB")

// workModel.create(workItem)

// todoModel.create(item2);
// let items = ["Eat", "Sleep", "Conquer", "Repeat"];
// let workItems = [];

// todoModel.create(item);

// todoModel.deleteMany({name:"food"})
//     .then((result) =>{
//         console.log("deleted sucessfullyy", result)
//     })
//     .catch((error) =>{
//         console.log(" gone", error)
//     })

const todoSchema = new mongoose.Schema({
    name : String,
})

const todoModel = mongoose.model("todoDB", todoSchema)

const item1 = new todoModel({
    name : "Welcome to To-Do App",
})

const item2 = new todoModel({
    name : "Type your message and click '+' to add into the list",
})

const item3 = new todoModel({
    name: "<--- Click on the checkbox to delete from the list"
})

const defaultList = [item1,item2,item3]

const listSchema = new mongoose.Schema({
    name: String,
    item : []
})

const listModel = new mongoose.model("list", listSchema)

// todoModel.create([item1,item2,item3])
//     .then((otp) =>{
//         console.log("Sucess:",otp)
//     })
//     .catch((err) => {
//         console.log("Error:", err)
//     })

// const workModel = new mongoose.model("workModel", todoSchema)

// const workItem = new workModel({
//     name : "files"
// })


todoModel.find({})
    .then((items) => {
        items.forEach((item) => {
            console.log(item.name)
        });
    })
    .catch((error) =>{
        console.log("error:",error)
    })

app.get("/", function(req, res){
    let newDay = date.getDate()
    // let catchDay =date.getDay()
    todoModel.find({})
    .then((items) => {
            res.render("list",{listTitle: "Today", newItems:items})
        })
    .catch((error) =>{
        console.log("error:",error)
    })
})

// app.get("/work", function(req,res){
//     workModel.find({})
//         .then((items) =>{
//             res.render("list", {listTitle: "Work List", newItems: items})
//         })
//         .catch((err) =>{
//             console.log("error: ", err)
//         })
// })

app.post("/", function(req, res){

    let item = req.body.addItems;
    let buttonCall = req.body.listButton;

    console.log("Success_button",buttonCall)

    const newItem = new todoModel({
        name : item,
    })
    // console.log("new item:",item)

    if(buttonCall === 'Today'){
        res.render('/')
    }
    else{
        listModel.findOne({ name: buttonCall})
        .then((foundList) =>{
            if(foundList){
                foundList.item.push(newItem)
                return foundList.save()
                // return listModel.create({item: foundList.item})
            }
            else{
                const newList = new listModel({
                    name: buttonCall,
                    item: []
                });
                return newList.save();
            }
        })
        .then((newCreatedList) =>{
            res.redirect("/"+buttonCall)

        })
        .catch((err)=>{
            console.log("error", err);
            res.status(500).send("Error occurred");
        })
    }

    // if(req.body.button === "Work"){
    //     // workItems.push(item);
    //     workModel.create(newItem)

    //     res.redirect("/work")
    // }
    // else{
    //     todoModel.create(newItem)

    //     // items.push(item);
    //     res.redirect("/")    
    // }
})

app.post("/delete", function(req,res){
    const temp = req.body.checkboxInp
    const listName = req.body.hiddenList
    console.log("ListName:", listName)

    if(listName === 'Today'){
        todoModel.deleteOne({_id:temp})
        .then((result) =>{
            console.log("sucessfully deleted:", result)
            res.redirect("/")
        })
        .catch((err)=>{
            console.log("Error:",err)
        })
    }

    else{
        listModel.findOne({name: listName})
        .then((foundList) =>{
            if(foundList){
                // return listModel.deleteOne({id:temp})
                return listModel.updateOne({ _id: foundList._id }, { $pull: { item: { _id: temp } } });
            }
            else{
                console.log("List not found")
                res.redirect("/")
            }
        })
        .then((foundList)=>{
            console.log("Sucessfully removed:", foundList)
            res.redirect("/"+listName)
        })  
        .catch((err) =>{
            console.log("error", err)
        })
    }

})

app.get("/:newList",function(req,res){
    console.log(req.params.newList)
    const newList = _.capitalize([req.params.newList])

    const newContent = new listModel({
        name : newList,
        item : defaultList
    })
    listModel.findOne({ name: newList })
    .then((foundList) => {
        if (!foundList) {
            return listModel.create(newContent);
        } else {
            return foundList;
        }
    })
    .then((createdOrFoundList) => {
        console.log("Success_newtab:", createdOrFoundList);
        res.render("list", { listTitle: createdOrFoundList.name, newItems: createdOrFoundList.item });
    })
    .catch((err) => {
        console.log("Error:", err);
    });
})

app.listen(3000, function(){
    console.log("app is running on port 3000")
})