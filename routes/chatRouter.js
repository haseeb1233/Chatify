const express = require("express")
const chatRouer = express.Router();
const {conModel} = require("../models/conModle")
const {msgModel} = require("../models/messageModle")
const { userModel } = require("../models/userModle");
const { log } = require("winston");
chatRouer.use(express.json());

chatRouer.get("/",async(req,res)=>{
    try{
        let data = await userModel.find()
        res.send(data)
    }catch(err){
        console.log(err.meassage)
    }
})
chatRouer.get("/findOne/:id",async(req,res)=>{
    try{
        let data = await userModel.find({_id:req.params.id})
        res.send(data)
    }catch(err){
        console.log(err.meassage)
    }
})

chatRouer.post("/getCon",async(req,res)=>{
    try{
        let data = await conModel.find({$or:[{userId:req.body.id },{frendId:req.body.id}]})
        res.send(data)
    }catch(err){
        console.log(err.meassage)
    }
})

chatRouer.post("/addCon",async(req,res)=>{
    console.log("addCon",req.body);
    try{
        console.log("inside of try of addCon");
        let data = await conModel.findOne({frendName:req.body.frendName})
        console.log(data);
        if(!data || (data.frendName !== req.body.frendName || data.myName !== req.body.myName)){
            console.log("yes");
            req.body.consId = Math.floor((Math.random() * 100) + 1);
            console.log(req.body);
            const {id,consId,frendName,frendId,frendAvtar,user,myAvtar} = req.body
            let newCon = new conModel({userId:id,consId,frendName,frendId,frendAvtar,myName:user,myAvtar,lastTime:Date(Date.now())});
            await newCon.save()
            res.send({msg:"added succesfully"})
        }else{
            res.send({err:"check"})
        }
    }catch(err){
        console.log(err.meassage)
    }
})

chatRouer.post("/getMsg",async(req,res)=>{
    // console.log(req.body.consId);
    try{
        //
        let booking =await msgModel.aggregate([{$match:{consId:req.body.consId }},{$sort:{time: -1}},{$limit:10}])
        res.send(booking)
    }catch(err){
        res.send({err:err.message})
    }
})
module.exports={chatRouer}