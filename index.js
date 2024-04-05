const express=require("express");
const body_parser=require("body-parser");
const axios=require("axios");
require('dotenv').config();

const app=express().use(body_parser.json());

const token=process.env.TOKEN;
const mytoken=process.env.MYTOKEN;//prasath_token

app.listen(process.env.PORT,()=>{
    console.log(process.env.MYTOKEN);
    console.log(`webhook is listening at port ${process.env.PORT}`);
});

//to verify the callback url from dashboard side - cloud api side
app.get("/webhook",(req,res)=>{
   let mode=req.query["hub.mode"];
   let challange=req.query["hub.challenge"];
   let token=req.query["hub.verify_token"];


    if(mode && token){

        if(mode==="subscribe" && token===mytoken){
            res.status(200).send(challange);
        }else{
            res.status(403);
        }

    }

});

app.post("/webhook",(req,res)=>{ //i want some 
console.log(req);
    let body_param=req.body;

    console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
        console.log("inside body param");
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]  
            ){
               let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
               let from = body_param.entry[0].changes[0].value.messages[0].from; 
               let message_type = body_param.entry[0].changes[0].value.messages[0].type; 
               let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

               console.log("phone number "+phon_no_id);
               console.log("from "+from);
               console.log("body param "+msg_body);

            if(message_type=="text"){
              axios({
                method:"POST",
                url:"https://graph.facebook.com/v18.0/"+phon_no_id+"/messages?access_token="+token,
                data:
                {
                 "messaging_product": "whatsapp",
                   "recipient_type": "individual",
                   "to": from,
                   "type": "interactive",
                   "interactive": {
                     "type": "product_list",
                     "header":{
                       "type": "text",
                       "text": "Catalogue"
                     },
                     "body": {
                       "text": "Welcome to your restaurant .Order now and Enjoy !!"
                     },
                     "footer": {
                       "text": "FoodWithFun"
                     },
                     "action": {
                       "catalog_id": "790425562974971",
                       "sections": [
                         {
                           "title": "Veg",
                           "product_items": [
                             { "product_retailer_id": "gmwcoxaqbq" },
                             { "product_retailer_id": "hl5chc29ni" },
                             { "product_retailer_id":"834nmhc71v"}
                            
                
                           ]
                         },
                         {
                           "title": "Non-Veg",
                           "product_items": [
                             { "product_retailer_id": "c233nzskgi" }
                          
                           ]
                         }
                       ]
                     }
                   }
                },
                headers:{
                    "Content-Type":"application/json"
                }

            });
            }
            if(message_type=="order"){
              axios({
                method:"POST",
                url:"https://graph.facebook.com/v18.0/"+phon_no_id+"/messages?access_token="+token,
                data:
                {
                 "messaging_product": "whatsapp",
                   "recipient_type": "individual",
                   "to": from,
                   "type": "contacts",
                   "contacts": [{
                       "addresses": [{
                           "street": "STREET",
                           "city": "CITY",
                           "state": "STATE",
                           "zip": "ZIP",
                           "country": "COUNTRY",
                           "country_code": "COUNTRY_CODE",
                           "type": "HOME"
                         },
                         {
                           "street": "STREET",
                           "city": "CITY",
                           "state": "STATE",
                           "zip": "ZIP",
                           "country": "COUNTRY",
                           "country_code": "COUNTRY_CODE",
                           "type": "WORK"
                         }],
                       "birthday": "YEAR_MONTH_DAY",
                       "emails": [{
                           "email": "EMAIL",
                           "type": "WORK"
                         },
                         {
                           "email": "EMAIL",
                           "type": "HOME"
                         }],
                       "name": {
                         "formatted_name": "NAME",
                         "first_name": "FIRST_NAME",
                         "last_name": "LAST_NAME",
                         "middle_name": "MIDDLE_NAME",
                         "suffix": "SUFFIX",
                         "prefix": "PREFIX"
                       },
                       "org": {
                         "company": "COMPANY",
                         "department": "DEPARTMENT",
                         "title": "TITLE"
                       },
                       "phones": [{
                           "phone": "PHONE_NUMBER",
                           "type": "HOME"
                         },
                         {
                           "phone": "PHONE_NUMBER",
                           "type": "WORK",
                           "wa_id": "PHONE_OR_WA_ID"
                         }],
                       "urls": [{
                           "url": "URL",
                           "type": "WORK"
                         },
                         {
                           "url": "URL",
                           "type": "HOME"
                         }]
                     }]
                 
                },
                headers:{
                    "Content-Type":"application/json"
                }

            });
            }

               res.sendStatus(200);
            }else{
                res.sendStatus(404);
            }

    }

});

app.get("/",(req,res)=>{
    res.status(200).send("hello this is webhook setup");
});