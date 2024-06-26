
const express=require("express");
const body_parser=require("body-parser");
const axios=require("axios");
require('dotenv').config();

const app=express().use(body_parser.json());

const token=process.env.TOKEN;
const mytoken=process.env.MYTOKEN;//prasath_token

app.listen(process.env.PORT,()=>{
    console.log(`webhook is listening `);
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

app.post("/webhook",async (req,res)=>{ 
console.log(req);
    let body_param=req.body;

    console.log("Body Param"+JSON.stringify(body_param,null,2));

    

    if(body_param.object){
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]  
            ){
               let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
               let name = body_param.entry[0].changes[0].value.contacts[0].profile.name;
               let from = body_param.entry[0].changes[0].value.messages[0].from; 
               let message_type = body_param.entry[0].changes[0].value.messages[0].type; 
               let msg_body = body_param.entry[0].changes[0].value.messages[0].text;

               console.log(`Message Type :${message_type}`);
               console.log("phone number "+phon_no_id);
               console.log("from "+from);
               console.log("message Type "+message_type);
               console.log("Phone Number ID"+phon_no_id);
               console.log("name "+name);
               console.log("from "+from);
               console.log(`Boolean : ${message_type == "text"}`);
               if(msg_body != undefined)
               console.log(`Message Body.:- ${msg_body.body}`);
           
             

            if(message_type == "text" && msg_body.body != undefined && msg_body.body.toLowerCase() == "hi"){
              try {
                const response = await  axios({
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
                         "text": `Hello ${name} Welcome to your restaurant .Order now and Enjoy !!`
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
                
              console.log("Response:", response.data);
            } catch (error) {
                console.error("Error:", error.message);
            }
          }
           
          else if(message_type == "text" && msg_body.body != undefined && msg_body.body.substring(0,7).toLowerCase() == "address"){
            try {
              const response = await  axios({
                method:"POST",
                url:"https://graph.facebook.com/v18.0/"+phon_no_id+"/messages?access_token="+token,
                data:
                {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": from,
                  "type": "interactive",
                  "interactive": {
                    "type": "list",
                    "header": {
                      "type": "text",
                      "text": "Payment Options"
                    },
                    "body": {
                      "text": "Choose your Payment Method wisely !!"
                    },
                    "footer": {
                      "text": "Hurry order now before products sell out !"
                    },
                    "action": {
                      "button": "Pay",
                      "sections": [
                        {
                          "title": "Select Payment Method",
                          "rows": [
                            {
                              "id": "UPI",
                              "title": "Pay with UPI",
                              "description": "please choose correct upi for payment"
                            },
                            {
                              "id": "cash",
                              "title": "Cash on Delivery",
                              "description": "please carrry cash for pay on delivery"
                            },
                            {
                              "id": "whatapp",
                              "title": "Pay on WhatsApp",
                              "description": "enable whatsapp upi topay on whatapp"
                            }
  
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
              
            console.log("Response:", response.data);
          } catch (error) {
              console.error("Error:", error.message);
          }
        }
            
            else if(message_type == "order") {
              axios({
                method:"POST",
                url:"https://graph.facebook.com/v18.0/"+phon_no_id+"/messages?access_token="+token,
                data:
                {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": from,
                  "type": "text",
                  "text": { 
                    "preview_url": false,
                    "body": `Hey ${name}.I have got your Order . Please write Address in chat with Format :-  ADDRESS : <Your Delivery ADDRESS>`
                    }
                },
                headers:{
                    "Content-Type":"application/json"
                }

            });
            }
            else if(message_type == "interactive" && body_param.entry[0].changes[0].value.messages[0].interactive['type'] == "list_reply"){
              axios({
                method:"POST",
                url:"https://graph.facebook.com/v18.0/"+phon_no_id+"/messages?access_token="+token,
                data:
                {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": from,
                  "type": "text",
                  "text": { 
                    "preview_url": false,
                    "body": `Congratulations ${name} ! 🎉 Your order is confirmed and on its way to deliciousness! 🍔🍕 Expect your mouth-watering treats to arrive soon.  😋 #HappyOrdering`
                    }
                },
                headers:{
                    "Content-Type":"application/json"
                }

            });
            }
          
            else{
              
              axios({
                method:"POST",
                url:"https://graph.facebook.com/v18.0/"+phon_no_id+"/messages?access_token="+token,
                data:
                {
                  "messaging_product": "whatsapp",
                  "recipient_type": "individual",
                  "to": from,
                  "type": "text",
                  "text": { 
                    "preview_url": false,
                    "body": "Please write 'HI' to Start.."
                    }
                },
                headers:{
                    "Content-Type":"application/json"
                }

            })
           
            }

            res.sendStatus(200);
          }
          // else{
          //   let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;

          //      axios({
          //       method:"POST",
          //       url:"https://graph.facebook.com/v18.0/"+phon_no_id+"/messages?access_token="+token,
          //       data:
          //       {
          //         "messaging_product": "whatsapp",
          //         "recipient_type": "individual",
          //         "to": "917304401513",
          //         "type": "text",
          //         "text": { 
          //           "preview_url": false,
          //           "body": "Thank you.Your Order has been successfully Placed .."
          //           }
          //       },
          //       headers:{
          //           "Content-Type":"application/json"
          //       }

          //   });
          //   res.sendStatus(200);

          // }
            }else{
                res.sendStatus(404);
            }

    }

  );

app.get("/",(req,res)=>{
    res.status(200).send("hello this is webhook setup");
});
