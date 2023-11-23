const mongoose = require("mongoose");
const User = require("../model/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.add = async (req, res) => {
    try {
        console.log('hgh', req.body);
        encryptedPassword = await bcrypt.hash(req.body.password, 10);


        data = {
           
            email: req.body.email,
            password: encryptedPassword,
            

        }

        console.log('hgdfsdh', data);
        const userdata = await new User(data).save().catch(

            error => {
                console.log('myerror', error)
                res.status(500).send(error)
            }

        )
        if (userdata) {

            res.status(200).json({ data: userdata, message: "data register successfully" });
        } else {

            //  res.status(201).json({ message: "data not register" });
        }



    } catch (e) {
        //res.status(401).send(e)
        console.log(e);
    }

}

module.exports.getdata = async (req, res) => {
    try {
        // const data = await User.find({}).where("role").equals("0");
        const data = await User.find({})


        res.status(200).json({ message: data });

    } catch (e) {
        res.status(401).send(e)

    }
}

module.exports.showdata = async (req, res) => {
    try {
        console.log(req.params.id);
        id = req.params.id
        const data = await User.findById(id);
        console.log(data)
        res.status(200).json({ message: data });

    } catch (e) {
        res.status(401).send(e)

    }
}
module.exports.updateData = async (req, res) => {
    try {
        console.log(req.params.id);
        id = req.params.id
        data = {
            
            email: req.body.email,
            password: req.body.password,
            

        }

        const updatedata = await User.findByIdAndUpdate(id, data, { new: true });
        console.log(updatedata)
        if (updatedata) {
            res.status(200).json({ data: updatedata, message: "data updated successfullly" });
        } else {
            res.status(201).json({ message: "data not updated" });


        }



    } catch (e) {
        console.log('here', e);
        res.status(401).send(e)


    }
}
module.exports.deleteData = async (req, res) => {
    try {
        console.log(req.params.id);

        deleteData = await User.findByIdAndDelete(req.params.id);
        if (deleteData) {
            res.status(200).json({ data: deleteData, message: "data deleted" });
        } else {
            res.status(201).json({ message: "data not deleted" });


        }
    } catch (e) {
        res.status(401).send(e)

    }
}
module.exports.login = async (req, res) => {
    try {
        //  console.log('header', req.headers);

        generate_key = "abcdefghifghfghfffhbhjghjghjghg";
        console.log("keys", generate_key)
        key = {
            token: generate_key,
        }
        const { email, password } = req.body;
        const updateKey = await User.findOneAndUpdate({ email }, key, { new: true });
        console.log("save key", updateKey)

        //start
        const user = await User.findOne({ email });
        console.log(user)
        if (user && (await bcrypt.compare(password, user.password))) {
            console.log("login token", user.token)
            // console.log("tokenn", user.id)
           
            // const token = jwt.sign({ user_id: user.id, email }, process.env.TOKEN_KEY, { expiresIn: "120", });
            const token = jwt.sign({ user_id: user.id, email, key: process.env.TOKEN_KEY }, process.env.TOKEN_KEY, );
            const user2 = user.toObject()
            
            delete user2.password;
            //   res.status(200).json({ data: user2 });

            res.status(200).json({ message: user2, token: token });
        } else {
            res.status(400).json({ messege: "Invalid Credentials" });
        }

    } catch (e) {
        res.status(401).send(e)
    }
}

module.exports.logout = async (req, res) => {
    try {
        console.log('bodyy1', req.body.id)
        console.log('bodyy', req.body.generate_key)
        const id = req.body.id;
        const key = {
            token: req.body.generate_key
        };
        console.log('bodyy11', key)
        // const generate_key = "rupakumarijhaghfghfghfgf";
        const updatedata = await User.findByIdAndUpdate(id, key, { new: true });
        console.log("destroy", updatedata)
        res.status(200).json({ data: updatedata });

    } catch (e) {
        res.status(401).send(e)
    }
}