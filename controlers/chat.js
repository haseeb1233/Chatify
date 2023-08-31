const addMsg =async(req,res)=>{
    try{
        req.body.time=new Date(req.body.checkin_date)
        let book = new msgModel(req.body)
        await book.save()
        res.send({msg:`msg added`})
    }catch(err){
        console.log(err.meassage)
    }
}

module.exports={addMsg}
