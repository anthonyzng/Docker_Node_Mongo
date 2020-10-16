var express = require('express');
var app = express();
const Joi = require('joi');
app.use(express.json());
//--------------------------------------mongo db
const MongoClient = require( 'mongodb' ).MongoClient;
const url = "mongodb://admin:123456@mongo:27017";
//--------------------------------------password validator
var passwordValidator = require('password-validator');
var schema = new passwordValidator();
schema.is().min(8);
schema.is().max(20);
schema.has().digits(1);
schema.has().uppercase(1);
schema.has().lowercase(1);
schema.not().spaces();
schema.has().symbols(1);
schema.is().not().oneOf(['MongoClient.connect', 'MongoClient','dbo.collection']);
//---------------------------------------------
const port = process.env.PORT || 8124;

//-------------------------------Restful API
app.get('/login', (req, res) => {

    if(req.query.account != null && req.query.pw != null ){
        if(schema.validate(req.query.pw)){

            var user = new User(req.query.account,req.query.pw);
            MongoClient.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true},function(err, db) {
                if (err) throw err;
                console.log('mongodb connected');
                var dbo = db.db("movie-app");
                //---------------------------find all
    
                // dbo.collection("account").find(user.getJson()).toArray(function(err,result){
                //     if(err) throw err;
    
                //     console.log("result : "+ result);
                //     res.send(result);
                //     db.close;
                // });
    
                //---------------------------find one
    
                dbo.collection("account").findOne(user.getJson(),function(err,result){
                    console.log(result);
                    res.send(result);
                });
                db.close;
            });
        }else{
            res.send('Wrong Account Or Password,Please try again.');
        };

    }else{
        console.log('404');
        return res.status(404);
    }
    
});

app.post('/createac', (req, res) => {
    if(req.query.account != null && req.query.pw != null ){
        if(schema.validate(req.query.pw)){
            var user = new User(req.query.account,req.query.pw);
            MongoClient.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true},function(err, db) {
                if (err) throw err;
                console.log('mongodb connected');
                var dbo = db.db("movie-app");
                
                dbo.collection("account").findOne(user.getJson(),function (err,result) {
                    if(err) throw err;
                    if(result){
                        console.log('have same name account name');
                        res.send('There are same account name,please use other account name.');
                    }else{
                        console.log('can create this account name');
                        dbo.collection("account").insertOne(user.getJson(),function(err,result){
                            if (err) throw err;
                            res.send(result);
                        });
                    }
                });
                db.close;
            });
        }else{
            res.send('Password must meet the required patten');
        };
    }else{
        return res.status(404);
    };
});


app.put('/updateac', (req, res) => {
    if(req.query.account != null && req.query.pw != null ){

        if(schema.validate(req.query.pw)){
            var user = new User(req.query.account,req.query.pw);
            MongoClient.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true},function(err, db) {
                if (err) throw err;
                console.log('mongodb connected');
                var dbo = db.db("movie-app");
                var query = {account:req.query.account};
                var new_data = {$set:{pw:req.query.pw}};
                dbo.collection("account").updateOne(query,new_data,function (err,result) {
                    if(err) throw err;
                    if(result){
                        console.log('updated');
                        res.send('updated');
                    }else{
                        console.log('update fail');
                        res.send('update fail');
                    }
                });
                db.close;
            });
        }else{
            res.send('Password must meet the required patten');
        };


    }else{
        return res.status(404);
    };
    
});

app.delete('/deleteac', (req, res) => {
    if(req.query.account!=null){
        MongoClient.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true},function(err, db) {
            if (err) throw err;
            console.log('mongodb connected');
            var dbo = db.db("movie-app");
            var query = {account:req.query.account};
            dbo.collection("account").deleteOne(query,function (err,result) {
                if(result){
                    res.send('deleted');
                }else{
                    res.send('fail delete');
                }
            });
            db.close;
        });
    }
    
});
//-------------------------------------------
app.listen(port, () => {
    console.log(`Hello world app listening on port`+ port);
    MongoClient.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true},function(err, db) {
        if (err) throw err;
        console.log('mongodb connected');
    });
});
//----------------------handle invalid url
app.get('*',(req,res)=>{ 
    res.send('invaild URL,please try again.');
});



class User{

//console.log(schema.validate('validPASS123')); use case
    constructor(ac,pw){
        this.account = ac;
        this.pw = pw;
    }

    get getAccount (){
        return this.account;
    }

    set setAccount (account){
        this.account = account;
    }

    get getPw (){
        return this.pw;
        // if(this.schema.validate(this.pw)){
        //     return this.pw;
        // }else{
        //     return 'Password not valid!!! Please comfirm your password is valid which mush include 1 Uppercase, 1 Lowercase , 1 Digits';
        // }
    }

    set setPw (pw){
        this.pw = pw;
    }

    getJson(){
        console.log(this.getPw);
        return {"account": this.getAccount, "pw": this.getPw};
    }
}