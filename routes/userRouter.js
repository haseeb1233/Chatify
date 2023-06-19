//-----------  All the Requirements/Imports Here  -----------------------------
const express = require("express");
let globleotp;
const jwt = require("jsonwebtoken");
const { validator, authorization } = require("../middleware/middlewares");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const { v4: uuidv4 } = require("uuid");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { userModel } = require("../models/userModle");
const { blockModel } = require("../models/blockModle");
const { tokenModel  } = require("../models/tokenModle");
const { otpModel  } = require("../models/otp");
const { redis } = require("../helpers/redis");
const { passport } = require("../configration/google.auth");
const bcrypt = require("bcrypt");
const userRouer = express.Router();

userRouer.use(express.json());

//------------------- Google Auth Here -----------------------------------------
userRouer.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouer.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async function (req, res) {
    let isUserBlocked = await blockModel.findOne({ email: req.user.email  });
    if (isUserBlocked) {
          return res.status(406).json({ error: `you are blocked` });
    }
    const fetch_user = await userModel.findOne({ email: req.user.email });
    if (fetch_user) {
      let token = jwt.sign(
        { user: req.user.name, id:fetch_user._id, role: fetch_user.role },
        process.env.token_key,
        { expiresIn: "30m" }
      );

      let refreshToken = jwt.sign(
        { user: req.user.name, id:fetch_user._id, role: fetch_user.role },
        process.env.refresh_key,
        { expiresIn: "120s" }
      );
      res.redirect(`http://127.0.0.1:5501/frontend/chatpage.html?avtar=${req.user.avtar}&id=${fetch_user._id}&myName=${fetch_user.name}&role=${fetch_user.role}&token=${token}&refreshToken=${refreshToken}`)
      console.log("here");
// res.redirect(`http://127.0.0.1:5501/frontend/chatpage.html?avtar=${req.user.avtar}&id=${fetch_user._id}&token=${token}&refreshToken=${refreshToken}`)

//console.log("here");


    } else {
      req.user.password = bcrypt.hashSync(req.user.password, 2);
      console.log(req.user,"2");
      const user = new userModel(req.user);
      await user.save();
      let findedUser = await userModel.findOne({email:req.user.email});
      console.log(findedUser,"3")

      let token = jwt.sign(
        { user: req.user.name, id:findedUser._id, role: findedUser.role },
        process.env.token_key,
        { expiresIn: "30m" }
      );
      let refreshToken = jwt.sign(
        { user: req.user.name, id:findedUser._id, role: findedUser.role },
        process.env.refresh_key,
        { expiresIn: "120s" }
      );
      // res.cookie("token", token);
      // res.status(202).json({ refreshToken });
      
      res.redirect(`http://127.0.0.1:5501/frontend/chatpage.html?avtar=${req.user.avtar}&id=${findedUser._id}&myName=${findedUser.name}&role=${findedUser.role}&token=${token}&refreshToken=${refreshToken}`)
      console.log("here");

    }
  }
);

//---------------- GitHub Auth Here --------------------------------------------
userRouer.get("/auth/github", (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`
  );
});
userRouer.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  const acces_Token = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  ).then((res) => res.json());
  const user = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${acces_Token.access_token}`,
      "content-type": "application/json",
    },
  }).then((res) => res.json());
  const user_Email = await fetch("https://api.github.com/user/emails", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${acces_Token.access_token}`,
      "content-type": "application/json",
    },
  }).then((res) => res.json());
  let user_details = {
    name: user.name,
    email: user_Email[0].email,
    password: uuidv4(),
    avtar: user.avatar_url,
    role: "user",
  };
  let isUserBlocked = await blockModel.findOne({ email: user_details.email });
    if (isUserBlocked) {
          return res.status(406).json({ error: `you are blocked` });
    }
  const fetch_user = await userModel.findOne({ email: user_details.email });
    if (fetch_user) {
      let token = jwt.sign(
        { user: fetch_user.name, id: fetch_user._id, role: "user" },
        process.env.token_key,
        { expiresIn: "30m" }
      );
      let refreshToken = jwt.sign(
        { user: fetch_user.name, id:fetch_user._id, role: "user" },
        process.env.refresh_key,
        { expiresIn: "120s" }
      );
      res.redirect(`http://127.0.0.1:5501/frontend/chatpage.html?avtar=${fetch_user.avtar}&id=${fetch_user._id}&myName=${fetch_user.name}&role=${fetch_user.role}&token=${token}&refreshToken=${refreshToken}`)
      console.log("here");


    } else {
      req.user.password = bcrypt.hashSync(user_details.password, 2);
      const user = new userModel(user_details);
      await user.save();
      let findedUser = await userModel.findOne({email:user_details.email});
      console.log(findedUser);
      let token = jwt.sign(
        { user: findedUser.name, id: findedUser._id, role: "user" },
        process.env.token_key,
        { expiresIn: "30m" }
      );
      let refreshToken = jwt.sign(
        { user: findedUser.name, id:findedUser._id, role: "user" },
        process.env.refresh_key,
        { expiresIn: "120s" }
      );
      // res.cookie("token", token);
      // res.status(202).json({ refreshToken });
      
      res.redirect(`http://127.0.0.1:5501/frontend/chatpage.html?avtar=${findedUser.avtar}&id=${findedUser._id}&myName=${findedUser.name}&role=${findedUser.role}&token=${token}&refreshToken=${refreshToken}`)
      console.log("here");
    }
});

//------------- Simlple User Routes ---------------------------------------------
userRouer.post("/reg", async (req, res) => {
  try {
    if (await userModel.findOne({ email: req.body.email })) {
      res.status(406).json({ error: `user is present.` });
    } else {
      req.body.password = bcrypt.hashSync(req.body.password, 2);
      const user = userModel(req.body);
      await user.save();
      res.status(202).json({ msg: `user is created.` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
userRouer.post("/log", async (req, res) => {
  try {
    const {email , password} = req.body
    let user = await userModel.findOne({ email });
    let isUserBlocked = await blockModel.findOne({ email });
    if (user) {
      if (isUserBlocked) {
        res.status(406).json({ error: `you are blocked` });
      }else{
        if (await bcrypt.compare(password, user.password)) {
          await userModel.findOneAndUpdate({email:user.email},{isActive:true})
          token_Genretor(res, user.name, user._id, user.role,user.avtar,user._id);
        } else {
          res.status(406).json({ error: `user password is worng..` });
        }
      }
    } else {
      res.status(406).json({ error: `user email is worng..` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
userRouer.post("/blockUser",validator,authorization, async (req, res) => {
  try {
    const {email} = req.body
    if (await blockModel.findOne({ email })) {
      res.status(405).json({ error: `you are in blocked ` });
    } else {
      const user = blockModel({ email });
      await userModel.findOneAndUpdate({email},{isBlocked:true})
      await user.save();
      res.status(202).json({ msg: `user block sucsesfully` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
})
userRouer.delete("/unBlockUser",validator,authorization, async (req, res) => {
  try {
    const {email} = req.body
    if (!await blockModel.findOne({ email })) {
      res.status(405).json({ error: `you are in blocked ` });
    } else {
      await blockModel.findOneAndDelete({ email });
      await userModel.findOneAndUpdate({email},{isBlocked:false})
      res.status(202).json({ msg: `user unblock sucsesfully` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
})
userRouer.post("/logout",validator, async (req, res) => {
  try {
    token = req.headers.refresh.split(" ")[1];
    if (checkInredis (req.body.name,token) || await tokenModel.findOne({ token })) {
      res.status(405).json({ error: `you are in  blacklist or logout` });
    } else {
      const user = tokenModel({ token });
      await user.save();
      await userModel.findOneAndUpdate({_id:req.body.id},{isActive:false,lastLogin:Date(Date.now())})
      res.status(202).json({ msg: `user logout sucsesfully` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
userRouer.post("/getOtp", async (req, res) => {
  console.log(req.body);
  const user=await userModel.findOne({ email: req.body.email })
  console.log(user)
  try {
    if (await userModel.findOne({ email: req.body.email })) {
      console.log("inside get otp after finduser email")
      globleotp = Math.floor(Math.random() * 1000000);
      console.log(globleotp);
      let newOtp =  otpModel({
        createdAt: new Date(),
        email: req.body.email,
        otp: globleotp
      });
      console.log(newOtp)
      await newOtp.save();
      sgMail.setApiKey(process.env.SendGrid_Key);
      const msg = {
        to: req.body.email,
        from: "ahaseebtk@gmail.com",
        subject: "Reset you Password for chatify App",
        text: `Your OTP for Reseting Passwrd is ${globleotp} valid for 5`,
      };
      await sgMail.send(msg).then(() => {
        res.status(202).json({ msg: `OTP sended on Email` });
      }).catch((err)=>{
        res.status(406).json({ err: err });
      })
      
    } else {
      res.status(406).json({ err: `you are not a  user.` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
userRouer.post("/forgot", async (req, res) => {
  try {
    let data = await otpModel.findOne({email:req.body.email});
    console.log(req.body.otp,data.otp,"ghk");
    if (req.body.otp && req.body.otp == data.otp) {
      console.log("body")
      let user = await userModel.findOne({ email: req.body.email });
      req.body.password = bcrypt.hashSync(req.body.password, 2);
      await userModel.findByIdAndUpdate(
        { _id: user._id },
        { password: req.body.password }
      );
      res.status(202).send({ msg: `Password is updated succesfully.` });
    } else {
      res.status(406).json({ err: `otp is wrong or expired.` });
    }
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
userRouer.put("/roleUpdate", validator, authorization, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.email });
    await userModel.findByIdAndUpdate(
      { _id: user._id },
      { role: req.body.changerole }
    );
    res.status(202).send({ msg: `Role is updated succesfully.` });
  } catch (err) {
    res.status(500).send({ err: err.message })
  }
});
//----------------- Addtional Functions Here -----------------------------------
function token_Genretor(res, name, id, role,avtar,id) {
  let token = jwt.sign(
    { user: name, id: id, role: role },
    process.env.token_key,
    { expiresIn: "120m" }  
  );
  let refreshToken = jwt.sign(
    { user: name, id: id, role: role },
    process.env.refresh_key,
    { expiresIn: "12h" }
  );
  res.cookie("token", token);
  res.status(202).json({ refreshToken ,token,avtar,id,role,myName:name});
}

function checkInredis (key , token){
  redis.get(key, (err, result) => {
    if (err) {
      return false
    } else {
      return result == token
    }
  });
}
//-------------------- All exports ---------------------------------------------
module.exports = { userRouer };












//old code //

// //-----------  All Requirements/Imports Here  ----------------
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const { validator, authorization } = require("../middleware/middlewares");
// require("dotenv").config();
// const sgMail = require("@sendgrid/mail");
// let globe_opt;
// const { v4: uuidv4 } = require("uuid");
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));
// const { userModel } = require("../models/userModle");
// const { blockModel } = require("../models/blockModle");
// const { redis } = require("../helpers/redis");
// const { passport } = require("../configration/google.auth");
// const bcrypt = require("bcrypt");
// const { log } = require("winston");
// const userRouer = express.Router();

// userRouer.use(express.json());

// //------------------- Google Auth Here -----------------------------------------
// userRouer.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// userRouer.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/login",
//     session: false,
//   }),
//   async function (req, res) {
//     const fetch_user = await userModel.findOne({ email: req.user.email });
//     if (fetch_user) {
//       let token = jwt.sign(
//         { user: req.user.name, id: "login with google", role: "user" },
//         process.env.token_key,
//         { expiresIn: "30m" }
//       );
//       let refreshToken = jwt.sign(
//         { user: req.user.name, id: "login with google", role: "user" },
//         process.env.refresh_key,
//         { expiresIn: "120s" }
//       );
//       res.redirect(`http://127.0.0.1:5501/frontend/chatpage.html?avtar=${req.user.avtar}&id=${fetch_user._id}&token=${token}&refreshToken=${refreshToken}`)
//       console.log("here");
//     } else {

//       req.user.password = bcrypt.hashSync(req.user.password, 2);
//       const user = new userModel(req.user);
//       await user.save();
//       let findedUser = await userModel.findOne({email:req.email});
//       let token = jwt.sign(
//         { user: req.user.name, id: "login with google", role: "user" },
//         process.env.token_key,
//         { expiresIn: "30m" }
//       );
//       let refreshToken = jwt.sign(
//         { user: req.user.name, id: "login with google", role: "user" },
//         process.env.refresh_key,
//         { expiresIn: "120s" }
//       );
//       // res.cookie("token", token);
//       // res.status(202).json({ refreshToken });
      
//       res.redirect(`http://127.0.0.1:5501/frontend/chatpage.html?avtar=${req.user.avtar}&id=${findedUser._id}&token=${token}&refreshToken=${refreshToken}`)
//       console.log("here");
//     }
//   }
// );

// //---------------- GitHub Auth Here --------------------------------------------



// userRouer.get("/auth/github", (req, res) => {
//   res.redirect(
//     `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`
//   );
// });
// userRouer.get("/auth/github/callback", async (req, res) => {
//   const { code } = req.query;
//   const acces_Token = await fetch(
//     "https://github.com/login/oauth/access_token",
//     {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "content-type": "application/json",
//       },
//       body: JSON.stringify({
//         client_id: process.env.GITHUB_CLIENT_ID,
//         client_secret: process.env.GITHUB_CLIENT_SECRET,
//         code,
//       }),
//     }
//   ).then((res) => res.json());
//   const user = await fetch("https://api.github.com/user", {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${acces_Token.access_token}`,
//       "content-type": "application/json",
//     },
//   }).then((res) => {
//     console.log(res)
//     return res.json()});
//   const user_Email = await fetch("https://api.github.com/user/emails", {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${acces_Token.access_token}`,
//       "content-type": "application/json",
//     },
//   }).then((res) => res.json());
//   let user_details = {
//     name: user.name,
//     email: user_Email[0].email,
//     password: uuidv4(),
//     avtar: user.avatar_url,
//     role: "custemer",
//   };
//   console.log(user_details)
//   const fetch_user = await userModel.findOne({ email: user_details.email });
//   if (fetch_user) {
//     token_Genretor(res, fetch_user.name, fetch_user._id, fetch_user.role);
//     res.redirect(`http://127.0.0.1:5501/frontend/chatpage.html?avtar=${req.user.avatar}&id=${fetch_user._id}&token=${token}&refreshToken=${refreshToken}`)
//   } else {
//     user_details.password = bcrypt.hashSync(user_details.password, 2);
//     const user = new userModel(user_details);
//     await user.save();
//     token_Genretor(res, user_details.name, "login with github", "custemer");
//     res.redirect(`http://127.0.0.1:5501/frontend/chatpage.html?avtar=${req.user.avatar}&id=${fetch_user._id}&token=${token}&refreshToken=${refreshToken}`)
//   }
// });

// //------------- Simlple User Routes ---------------------------------------------
// userRouer.post("/reg", async (req, res) => {
//   try {
//     if (await userModel.findOne({ email: req.body.email })) {
//       res.status(406).json({ error: `uiser is alredy present.` });
//     } else {
//       req.body.password = bcrypt.hashSync(req.body.password, 2);
//       const user = userModel(req.body);
//       await user.save();
//       res.status(202).json({ msg: `user is created.` });
//     }
//   } catch (err) {
//     res.status(500).send({ err: err.message });
//   }
// });
// userRouer.post("/log", async (req, res) => {
//   console.log(req.body);
//   try {
//     const {email , password} = req.body
//     let user = await userModel.findOne({ email });
//     let isUserBlocked = await blockModel.findOne({ email });
//     if (user) {
//       if (isUserBlocked) {
//         res.status(406).json({ error: `you are blocked` });
//       }else{
//         if (await bcrypt.compare(password, user.password)) {
//           await userModel.findOneAndUpdate({email:user.email},{isActive:true})
//           token_Genretor(res, user.name, user._id, user.role,user.avtar,user._id);
//         } else {
//           res.status(406).json({ error: `user password is worng..` });
//         }
//       }
//     } else {
//       res.status(406).json({ error: `user email is worng..` });
//     }
//   } catch (err) {
//     res.status(500).send({ err: err.message });
//   }
// });
// userRouer.post("/blockUser",validator,authorization, async (req, res) => {
//   try {
//     const {email} = req.body
//     if (await blockModel.findOne({ email })) {
//       res.status(405).json({ error: `you are in alredy blocked ` });
//     } else {
//       const user = blockModel({ email });
//       await user.save();
//       res.status(202).json({ msg: `user block sucsesfully` });
//     }
//   } catch (err) {
//     res.status(500).send({ err: err.message });
//   }
// })
// userRouer.delete("/unBlockUser",validator,authorization, async (req, res) => {
//   try {
//     const {email} = req.body
//     if (await blockModel.findOne({ email })) {
//       res.status(405).json({ error: `you are in alredy blocked ` });
//     } else {
//       const user = blockModel.findOneAndDelete({ email });
//       await user.save();
//       res.status(202).json({ msg: `user unblock sucsesfully` });
//     }
//   } catch (err) {
//     res.status(500).send({ err: err.message });
//   }
// })
// userRouer.post("/logout",validator, async (req, res) => {
//   try {
//     token = req.headers.authorization.split(" ")[1];
//     if (checkInredis (req.body.name,token) || await tokenModel.findOne({ token })) {
//       res.status(405).json({ error: `you are in alredy blacklist or logout` });
//     } else {
//       const user = tokenModel({ token });
//       await user.save();
//       redis.set(req.body.name,token)
//       redis.EXPIRE(req.body.name,2000)
//       console.log("redis set",token );
//       await userModel.findOneAndUpdate({_id:req.body.id},{isActive:false,lastLogin:Date(Date.now())})
//       res.status(202).json({ msg: `user logout sucsesfully` });
//     }
//   } catch (err) {
//     res.status(500).send({ err: err.message });
//   }
// });
// userRouer.post("/getOtp", async (req, res) => {
//   try {
//     if (await userModel.findOne({ email: req.body.email })) {
//       globe_opt = Math.floor(Math.random() * 1000000);
//       sgMail.setApiKey(process.env.SendGrid_Key);
//       const msg = {
//         to: req.body.email,
//         from: "itsmahendramohane11@gmail.com",
//         subject: "Reset you Password for whats app",
//         text: `Your OTP for Reseting Passwrd is ${globe_opt}`,
//       };
//       await sgMail.send(msg);
//       res.status(202).json({ msg: `OTP sended on Email` });
//     } else {
//       res.status(406).json({ error: `you are not a  user.` });
//     }
//   } catch (err) {
//     res.status(500).send({ err: err.message });
//   }
// });
// userRouer.post("/forgot", async (req, res) => {
//   try {
//     if (req.body.otp && req.body.otp == globe_opt) {
//       let user = await userModel.findOne({ email: req.body.email });
//       req.body.password = bcrypt.hashSync(req.body.password, 2);
//       await userModel.findByIdAndUpdate(
//         { _id: user._id },
//         { password: req.body.password }
//       );
//       res.status(202).send({ msg: `Password is updated succesfully.` });
//     } else {
//       res.status(400).json({ error: `wrong opt` });
//     }
//   } catch (err) {
//     res.status(500).send({ err: err.message });
//   }
// });
// userRouer.put("/roleUpdate", validator, authorization, async (req, res) => {
//   try {
//     let user = await userModel.findOne({ email: req.body.email });
//     await userModel.findByIdAndUpdate(
//       { _id: user._id },
//       { role: req.body.changerole }
//     );
//     res.status(202).send({ msg: `Role is updated succesfully.` });
//   } catch (err) {
//     res.status(500).send({ err: err.message })
//   }
// });
// //----------------- Addtional Functions Here -----------------------------------
// function token_Genretor(res, name, id, role,avtar,id) {
//   let token = jwt.sign(
//     { user: name, id: id, role: role },
//     process.env.token_key,
//     { expiresIn: "30m" }  
//   );
//   let refreshToken = jwt.sign(
//     { user: name, id: id, role: role },
//     process.env.refresh_key,
//     { expiresIn: "120s" }
//   );
//   res.cookie("token", token);
//   res.status(202).json({ refreshToken ,token,avtar,id});
// }

// function checkInredis (key , token){
//   redis.get(key, (err, result) => {
//     if (err) {
//       return false
//     } else {
//       return result == token
//     }
//   });
// }
// //-------------------- All exports ---------------------------------------------
// module.exports = { userRouer };
