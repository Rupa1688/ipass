const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const fs = require('fs');
const EmailModel = require("../model/emailModel");
const PhoneModel = require("../model/phoneModel");
const emailModel = require("../model/emailModel");

 module.exports.seon = async (req, res) => {

    const axios = require('axios').default;
    try {
        //email
        
        if(!req.body.phone_number){

        const email_api = await axios({
            url: 'https://api.seon.io/SeonRestService/email-api/v2.2/' + req.body.email,
            method: 'GET',
            headers:
            {
                'X-API-KEY': 'bab29184-9638-49b7-91a2-d72b3b6e9645'
            },

        }).catch(function (error) {
            console.log("error", error)
        })
        console.log("email_api",email_api.data)
       
       const detailEmail=await new EmailModel(email_api.data).save();
         console.log(detailEmail)

         res.status(200).json({ email_data: detailEmail,message:"data registered"})
        }else if(!req.body.email){
//phoneApi
const phone_api = await axios({
    url: 'https://api.seon.io/SeonRestService/phone-api/v1.3/'+req.body.phone_number,
    method: 'GET',
    headers:
    {

        'X-API-KEY': 'bab29184-9638-49b7-91a2-d72b3b6e9645'
    },

}).catch(function (error) {
    console.log("error", error)
})

const detailPhone=await new PhoneModel(phone_api.data.data).save();
res.status(200).json({ phone_data:detailPhone,message:"data registered"})

       
  }else{
    const email_api = await axios({
        url: 'https://api.seon.io/SeonRestService/email-api/v2.2/' + req.body.email,
        method: 'GET',
        headers:
        {

            'X-API-KEY': 'bab29184-9638-49b7-91a2-d72b3b6e9645'
        },

    }).catch(function (error) {
        console.log("error", error)
    })
    console.log("email_api",email_api.data)
   
   const detailEmail=await new EmailModel(email_api.data).save();
     console.log(detailEmail)
    //  phoneApi
const phone_api = await axios({
    url: 'https://api.seon.io/SeonRestService/phone-api/v1.3/'+req.body.phone_number,
    method: 'GET',
    headers:
    {

        'X-API-KEY': 'bab29184-9638-49b7-91a2-d72b3b6e9645'
    },

}).catch(function (error) {
    console.log("error", error)
})

const detailPhone=await new PhoneModel(phone_api.data.data).save();
     
res.status(200).json({ email_data: detailEmail,phone_data:detailPhone })


  }

} catch (e) {
         
        res.status(500).send(e)
    }
 }

    module.exports.sAllData = async (req, res) => {
        try {
  
       
       const data = await emailModel.find().lean();
     console.log(data);
       res.status(200).json({ data: data});
  
        }catch(e){
          res.status(500).send(e);   
        }
      }

      module.exports.getoneData = async (req, res) => {
        try {
  
   
       const data = await emailModel.findOne({"_id":req.params.id});;
     console.log(data);
       res.status(200).json({ data: data});
  
        }catch(e){
          res.status(500).send(e);   
        }
      }
