const mongoose = require("mongoose");
const ipassVeriff = require("../model/ipassVeriff");
const imagemodel = require("../model/imageModel");
const personModel = require("../model/personModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var uuid = require('uuid');
var crypto = require('crypto');
const fs = require('fs');

const mime = require('mime');
const { url } = require("inspector");
const { response } = require("express");


module.exports.sessions = async (req, res) => {
    try {

        var request = require('request');
        var options = {
            method: 'POST',
            url: process.env.STATION_API+'/v1/sessions/',
            headers:
            {
                'Content-Type': 'application/json',
                
                'X-AUTH-CLIENT': process.env.PUBLIC_KEY
            },
          
            body:
            {
                verification:
                {
                    callback: 'https://veriff.com',

                    person:
                    {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        idNumber: req.body.idNumber,
                    },
                    document: req.body.document,
                    vendorData:req.body.vendorData,
                    timestamp: req.body.timestamp
                }
            },
            
            json: true
        };
        

        request(options, async function (error, response, body) {
            if (error) throw new Error(error);

             console.log("body", body);
             console.log("body", req.body)
            
           const  data = {
                integration: req.body.integration,
                fname: req.body.fname,
                lname: req.body.lname,
                uniq_id: req.body.uniq_id,
                update_at:req.body.update_at,  
                veriff_code: body.verification.id,
                url: body.verification.url,
                vendorData: body.verification.vendorData,
                host: body.verification.host,
                status: body.verification.status,
                sessionToken: body.verification.sessionToken,

            }
            

            const ipassdata = await new ipassVeriff(data).save();
            console.log("ipassdata",ipassdata)
            res.status(200).json({ data: ipassdata, message: "data register successfully" });

        });


    } catch (e) {
        res.status(500).send(e)
        console.log(e);
    }

}

module.exports.sessionsUpdate = async (req, res) => {
    try {
        var request = require('request');

  const payloadAsString= JSON.stringify({ verification:
            { status: req.body.status,
              timestamp: req.body.timestamp
            }
        });


        signature = crypto
        .createHmac('sha256', process.env.PRIVATE_KEY)
        .update(Buffer.from(payloadAsString, 'utf8'))
        .digest('hex')
        .toLowerCase(); 
        
        var options = { method: 'PATCH',
          url: process.env.STATION_API+'/v1/sessions/'+req.params.id,
          headers:
           { 'Content-Type': 'application/json',
             'X-HMAC-SIGNATURE': signature,
             'X-AUTH-CLIENT': process.env.PUBLIC_KEY
            },
          body:
           { verification:
              { 
                status: req.body.status,
                timestamp: req.body.timestamp
              }
           },
          json: true };
        
        request(options,async function (error, response, body) {
          
          if (error) throw new Error(error);
          console.log("erorr",error)

          // console.log("body",body);

        const updatedata = await ipassVeriff.findOneAndUpdate({"variff_code":req.params.id}, body.verification, { new: true });
        res.status(200).json({ data: updatedata, message: "data updated successfully" });

        });


    }catch(e){
        res.status(500).send(e)
       
    }
}


module.exports.sessionsDelete = async (req, res) => {
    try {
        var request = require('request');
        
        const payloadAsString= req.params.id,
   
        signature = crypto
        .createHmac('sha256',process.env.PRIVATE_KEY)
        .update(Buffer.from(payloadAsString, 'utf8'))
        .digest('hex')
        .toLowerCase(); 

        var options = {
          method: 'DELETE',
          url: process.env.STATION_API+'/v1/sessions/'+req.params.id,
          headers: {
             'Content-Type': 'application/json',
             'X-HMAC-SIGNATURE': signature,
             'X-AUTH-CLIENT': process.env.PUBLIC_KEY
          },
         };
        
        request(options, async function (error, response, body) {
          if (error) throw new Error(error);
          
        
          console.log(body);
         // const deletedata = await ipassVeriff.findOneAndDelete({"variff_code":req.params.id}, body.verification, { new: true });
        //res.status(200).json({ data: deletedata, message: "data deleted successfully" });

        });


    }
    catch(e){
        res.status(500).send(e)
        console.log("e",e)
    }
}

module.exports.sessionsMedia = async (req, res) => {
    
      var result = await getImage(req.params.id)
      const data=JSON.parse(result)
    
      const length=data.images.length
      let i=0
      const imageArr=[];
       const isItDoneYet = new Promise((resolve, reject) => {
        data.images.forEach(async function callback(value, index) {
          
              const media_result = await mediaApi(value.id)
  
                let obj = {}
                obj[value.name] = media_result
               imageArr.push(obj)
               i++

              if(i == length) {
                
                resolve(imageArr)
              }
        })
      })
  
      isItDoneYet.then(response=>{
  
        res.status(200).json({"imageData":response});
     })
   
}



module.exports.sessionsMediaPost = async (req, res) => {
 
const arr=[];

const isItDoneYet = new Promise((resolve, reject) => {
  var length = req.body.image.length
  let i=0
   req.body.image.forEach(async function callback(value, index) {
    
   var result = await uploadVerifImage(value.context,value.content,value.timestamp,req.params.id)
  
    const  data = {
      media_id: result.image.id,
      name: result.image.name,
      context: result.image.context,
      timestamp: result.image.timestamp,
      size: result.image.size,
      mimetype: result.image.mimetype,
       url:result.image.url,
      sessionId: result.image.sessionId

  }
  

  const imagedata = await new imagemodel(data).save();

    arr.push(imagedata)

    i++
    if(i == length) {
      resolve(arr)
    }
    })
   })

    isItDoneYet.then(response=>{
      
      res.status(200).json({ data: response, message: "data register successfully" });
    })
 
  }


  const getImage = async(id) => {
    try {
     
      var request = require('request');
      
      const payloadAsString=id;
      signature = crypto
      .createHmac('sha256', process.env.PRIVATE_KEY)
      .update(Buffer.from(payloadAsString, 'utf8'))
      .digest('hex')
      .toLowerCase(); 
     
      var options = { method: 'GET',
        url: process.env.STATION_API+'/v1/sessions/'+id+'/media',
        headers:
         { 'Content-Type': 'application/json',
           'X-HMAC-SIGNATURE': signature,
           'X-AUTH-CLIENT': process.env.PUBLIC_KEY } };
           const isItDoneYet = new Promise((resolve, reject) => {
      request(options,async function (error, response, body) {
        if (error) reject(error);
        resolve(body);                 
      });
      
         });
     
        return isItDoneYet.then(res=>{
          
         return res
         
     
         })
    }catch(e){
      return e
    }
  }



const uploadVerifImage = async(context,content,timestamp, apiUrl) => {

  try {
    
    var request = require('request');
    
     var base64str = await base64_encode('./uploads/a2.jpeg');

//     // Helper function
    function base64_encode(file) {
        return "data:image/png;base64," + fs.readFileSync(file, 'base64');
    }
  const payloadAsString= JSON.stringify({ image:
            { context: context,
              content: content,
              timestamp:timestamp,
             },
            });
            // console.log('context');
   
        signature = crypto
        .createHmac('sha256', process.env.PRIVATE_KEY)
      .update(Buffer.from(payloadAsString, 'utf8'))
        .digest('hex')
        .toLowerCase(); 

var options = { method: 'POST',

  url: process.env.STATION_API+'/v1/sessions/'+apiUrl+'/media',
  headers:
   { 'Content-Type': 'application/json',
     'X-HMAC-SIGNATURE': signature,
     'X-AUTH-CLIENT': process.env.PUBLIC_KEY 
    },
  body:
   { 
    image:
    { context: context,
      content: content,
      timestamp:timestamp,
     },
 },

  json: true };

let result

const isItDoneYet = new Promise((resolve, reject) => {
   request(options,async function (error, response, body){
    if (error) reject(error);
       resolve(body);
     })
 
    });

   return isItDoneYet.then(res=>{
    return res

    })
   }
    catch(error){
        return error
    }


}

const mediaApi = async(mediaid) => {
  try {
    
    var request = require('request');
            
            const payloadAsString=mediaid;
            signature = crypto
            .createHmac('sha256', process.env.PRIVATE_KEY)
            .update(Buffer.from(payloadAsString, 'utf8'))
            .digest('hex')
            .toLowerCase(); 

            var options = { method: 'GET',
              url: process.env.STATION_API+'/v1/media/'+mediaid,
              headers:
               { 'Content-Type': 'application/json',
                 'X-HMAC-SIGNATURE': signature,
                 'X-AUTH-CLIENT': process.env.PUBLIC_KEY
               }
             };
             const isItDoneYet = new Promise((resolve, reject) => {
            request(options, function (error, response, body) {
                if (error) reject(error);
                // console.log("body",body)
                resolve(body);
              
              }).pipe(fs.createWriteStream('./uploads/a6.jpeg'));

            });
            return isItDoneYet.then(res=>{
              return res

            })


  } catch(error){
        return error
    }
}
module.exports.sessionsPerson = async (req, res) => {
    try {

        var request = require('request');
        const payloadAsString=req.params.id,
        signature = crypto
        .createHmac('sha256', process.env.PRIVATE_KEY )
        .update(Buffer.from(payloadAsString, 'utf8'))
        .digest('hex')
        .toLowerCase(); 
        
        var options = { method: 'GET',
          url: process.env.STATION_API+'/v1/sessions/'+req.params.id+'/person',
          headers:
           { 'Content-Type': 'application/json',
             'X-HMAC-SIGNATURE': signature,
             'X-AUTH-CLIENT': process.env.PUBLIC_KEY 
             } 
          };
        
        request(options, async function (error, response, body) {
          if (error) throw new Error(error);
        
          console.log(body);
        
    
          
          res.status(200).json({data:body})
        });

    }catch(e){
       
        res.status(500).send(e);
        
    }
}
module.exports.sessionsWatchlist = async (req, res) => {
    try {
        
        var request = require('request');
        const payloadAsString=req.params.id,
        
        signature = crypto
        .createHmac('sha256', process.env.PRIVATE_KEY)
        .update(Buffer.from(payloadAsString, 'utf8'))
        .digest('hex')
        .toLowerCase(); 
      
        var options = { method: 'GET',
          url: process.env.STATION_API+'/v1/sessions/'+req.params.id+'/watchlist-screening',
          headers:
          { 'Content-Type': 'application/json',
            'X-HMAC-SIGNATURE': signature,
            'X-AUTH-CLIENT': process.env.PUBLIC_KEY 
          }
         };

        request(options, function (error, response, body) {
          if (error) throw new Error(error);

          // console.log(body);
          res.json({message:body})

        });


    }catch(e){
        res.status(500).send(e);
    }
}

module.exports.sessionsAttempts = async (req, res) => {
    try {

        var request = require('request');
        const payloadAsString=req.params.id,
        
        signature = crypto
        .createHmac('sha256', process.env.PRIVATE_KEY)
        .update(Buffer.from(payloadAsString, 'utf8'))
        .digest('hex')
        .toLowerCase(); 
        var options = { method: 'GET',
          url: process.env.STATION_API+'/v1/sessions/'+req.params.id+'/attempts',
          headers:
           { 'Content-Type': 'application/json',
             'X-HMAC-SIGNATURE': signature,
             'X-AUTH-CLIENT': process.env.PUBLIC_KEY
             }
           };
        
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
        
          console.log(body);
          res.status(200).json({data:body})
        });


    }catch(e){
        res.status(500).send(e);
    }
}

module.exports.attemptsMedia = async (req, res) => {
  // atempt id use
    try {
    var request = require('request');
    const payloadAsString=req.params.id,
    signature = crypto
    .createHmac('sha256', process.env.PRIVATE_KEY)
    .update(Buffer.from(payloadAsString, 'utf8'))
    .digest('hex')
    .toLowerCase(); 

    var options = { method: 'GET',
      url: process.env.STATION_API+'/v1/attempts/'+req.params.id+'/media',
      headers:
      { 'Content-Type': 'application/json',
        'X-HMAC-SIGNATURE': signature,
        'X-AUTH-CLIENT': process.env.PUBLIC_KEY
       }
     };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      
      res.status(200).json({data:body})
    });

    }catch(e)
    {
        res.status(500).send(e);
    }
}


module.exports.transportation_registery = async (req, res) => {
    try {
        //atempt id use
        var request = require('request');
        const payloadAsString=req.params.id,
        signature = crypto
        .createHmac('sha256', process.env.PRIVATE_KEY)
        .update(Buffer.from(payloadAsString, 'utf8'))
        .digest('hex')
        .toLowerCase(); 

        var options = {
          method: 'GET',
          url: process.env.STATION_API+'/v1/transportation-registry/'+req.params.id,
          headers:  
          {
            'Content-Type': 'application/json',
            'X-HMAC-SIGNATURE': signature,
            'X-AUTH-CLIENT':  process.env.PUBLIC_KEY
          }
        };

        request(options, function (error, response, body) {
          if (error) throw new Error(error);

          console.log(body);
          res.status(200).json({data:body})
        });

      }catch(e){
            res.status(500).send(e); 
        }
    }

    module.exports.address_media = async (req, res) => {
        try {
            //address id used
            
            var request = require('request');
            const payloadAsString=req.params.id;
            signature = crypto
            .createHmac('sha256', process.env.PRIVATE_KEY)
            .update(Buffer.from(payloadAsString, 'utf8'))
            .digest('hex')
            .toLowerCase(); 
            var options = { 
                method: 'GET',
            url: process.env.STATION_API+'/v1/address/'+req.params.id+'/media',
            headers:
            { 'Content-Type': 'application/json',
                'X-HMAC-SIGNATURE': signature,
                'X-AUTH-CLIENT':  process.env.PUBLIC_KEY
               }
             };

            request(options, function (error, response, body) {
            if (error) throw new Error(error);

            // console.log(body);
            res.status(200).json({data:body})
            });
            }catch(e){
                res.status(500).send(e);  
            }
    }
    module.exports.sessionsDecision = async (req, res) => {
        try {
            // session id used

            var request = require('request');

            const payloadAsString=req.params.id;
            signature = crypto
            .createHmac('sha256', process.env.PRIVATE_KEY)
            .update(Buffer.from(payloadAsString, 'utf8'))
            .digest('hex')
            .toLowerCase(); 
            var options = { method: 'GET',
              url: process.env.STATION_API+'/v1/sessions/'+req.params.id+'/decision',
              headers:
               { 'Content-Type': 'application/json',
                 'X-HMAC-SIGNATURE': signature,
                 'X-AUTH-CLIENT': process.env.PUBLIC_KEY
               } 
             };
            
            request(options, function (error, response, body) {
              if (error) throw new Error(error);
            
              console.log(body);
              res.status(200).json({data:body})
            });


        }catch(e){
            res.status(500).send(e);  
        }
    }
    module.exports.media = async (req, res) => {
        try {
            //use media id means image id
            // var request = require('request');
            
            // const payloadAsString=req.params.id;
            // signature = crypto
            // .createHmac('sha256', process.env.PRIVATE_KEY)
            // .update(Buffer.from(payloadAsString, 'utf8'))
            // .digest('hex')
            // .toLowerCase(); 

            // var options = { method: 'GET',
            //   url: process.env.STATION_API+'/v1/media/'+req.params.id,
            //   headers:
            //    { 'Content-Type': 'application/json',
            //      'X-HMAC-SIGNATURE': signature,
            //      'X-AUTH-CLIENT': process.env.PUBLIC_KEY
            //    }
            //  };
        
            // request(options, function (error, response, body) {
            //     if (error) throw new Error(error);
            //     console.log("body",body)
            //     res.status(200).json({data:body})
            //   }).pipe(fs.createWriteStream('./uploads/a4.jpeg'));

        }catch(e){
            res.status(500).send(e);  
        }
    }
    
    module.exports.addressMedia = async (req, res) => {
        try {
            // use media id;    
            var request = require('request');
            const payloadAsString=req.params.id;
            signature = crypto
            .createHmac('sha256', process.env.PRIVATE_KEY)
            .update(Buffer.from(payloadAsString, 'utf8'))
            .digest('hex')
            .toLowerCase(); 
            var options = { method: 'GET',
            url: process.env.STATION_API+'/v1/address-media/'+req.params.id,
            headers:
            { 'Content-Type': 'application/json',
                'X-HMAC-SIGNATURE': signature,
                'X-AUTH-CLIENT': process.env.PUBLIC_KEY 
            } 
          };

            request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
            res.status(200).json({data:body})
            });

        }catch(e){
            res.status(500).send(e);   
        }
    }

    module.exports.sessionsAllData = async (req, res) => {
      try {

     
     const data = await ipassVeriff.find({});

     res.status(200).json({ data: data});

      }catch(e){
        res.status(500).send(e);   
      }
    }
    
    module.exports.sessionsDetail = async (req, res) => {
      try {

     
     const data = await ipassVeriff.findOne({"veriff_code":req.params.id});

     res.status(200).json({ data: data});

      }catch(e){
        res.status(500).send(e);   
      }
    }
    
    


