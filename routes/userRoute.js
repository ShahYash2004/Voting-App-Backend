const express = require("express");
const router = express.Router();
const User = require("./../models/user.model.js");
const { generateToken, jwtAuthMiddleware } = require("./../jwt");
const bcrypt = require('bcrypt');

//singUp To person 
router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    
    // Check if there is already an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (data.role === 'admin' && adminUser) {
        return res.status(400).json({ error: 'Admin user already exists' });
    }

    // Validate Aadhar Card Number must have exactly 12 digit
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
      return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
  }

  // Check if a user with the same Aadhar Card Number already exists
  const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
  if (existingUser) {
      return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
  }

    // Assuming User model is imported correctly
    const response = new User(data);
    
    // Ensure to await the save operation
    await response.save();
    
    // Generate token after saving the user
    payload={
      id :response.id,
    }
    const token = generateToken(payload);
    console.log("Token generated:", token);

    // Return the user object and token in the response
    res.status(200).json({ user: response, token: token });
  } catch (e) {
    console.error("Error occurred during signup:", e.message);
    res.status(500).json({
      error: "Internal server error!",
    });
  }
});

//login To person
router.post("/login", async (req, res) => {
     try{
  // extract value from body
 const { aadharCardNumber , password } = req.body;

  //finding user
  const user = await User.findOne({  aadharCardNumber : aadharCardNumber });

  //if user does not exist or password doen not match , return error
  if(!user || !(await user.comparePassword(password))){
    return res.status(401).json({error : 'Invalid username or password'})
  }

//generateToken
const payload ={
    id :user._id ,
  }
 const token = generateToken(payload);
 res.json({token})
}
catch(e){
    console.log(e)
    res.status(500).json({error:'internal server error!!'})
}
});

//profile setup
router.get("/profie",jwtAuthMiddleware,async(req,res)=>{
    try{
    const userId = req.jwtUserData
    const userIdData = userId._id
    console.log("prpfile",userIdData)
    const findUser= await User.findById(userIdData)
    res.status(200).json({findUser})
    }
    catch(err){
        res.status(500).json({err : 'internal server error!!!'})
    }
})


router.post('/profile/newpassword', async (req, res) => {
      try {
        const { aadharCardNumber, newpassword } = req.body;
    
        // Validate input
        if (!aadharCardNumber || !newpassword) {
          return res.status(400).json({ error: 'Aadhar Card Number and new password are required' });
        }
    
        // Find the user by Aadhaar card number
        const user = await User.findOne({ aadharCardNumber });
        if (!user) {
          return res.status(403).json({ error: 'Invalid Aadhaar card number' });
        }
    
        payload={
          newpassword : newpassword
        }
        // Hash the new password
      const hashedPassword= generateToken(payload)
    
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
    
        res.status(200).json({ message: 'Password updated successfully' });
      } catch (e) {
        // Log the error for debugging
        console.error('Error updating password:', e);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

module.exports = router;
