const express = require("express");
const router = express.Router();
const Candidate = require("./../models/candidate.js");
const User = require("./../models/user.model.js");
const { generateToken, jwtAuthMiddleware } = require("./../jwt");
const { route } = require("./userRoute.js");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};


router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.jwtUserData.id)))
      return res.status(404).json({ message: "user has not admin role" });

    const data = req.body;

    // Assuming candidate model is imported correctly
    const newCandidate = new Candidate(data);

    // Ensure to await the save operation
    const response = await newCandidate.save();

    // Return the user object and token in the response
    res.status(200).json({ response: response });
  } catch (e) {
    console.error("Error occurred during signup:", e.message);
    res.status(500).json({
      error: "Internal server error!",
    });
  }
});

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //updated data
  try {
    if (!checkAdminRole(req.jwtUserData.id))
      return res.status(404).json({ message: "user has not admin role" });

    const personId = req.params.candidateId;
    const updatedpersonData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      personId,
      updatedpersonData,
      {
        new: true, //return the updated document
        runValidators: true, //run mongoose validation
      }
    );

    if (!response) {
      return res.status(404).json({ error: "person not found" });
    }
    res.status(200).json({ response });
  } catch (err) {
    res.status(500).json({ err: "internal server error!!!!!" });
  }
});

router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //delete data
  try {
    if (!checkAdminRole(req.jwtUserData.id))
      return res.status(403).json({ message: "user does not have admin role" });

    const personId = req.params.candidateId; //extract from url

    const response = await Candidate.findByIdAndDelete(personId);

    if (!response) {
      return res.status(404).json({ error: "person not found" });
    }
    res.status(200).json({ response });
  } catch (err) {
    res.status(500).json({ err: "internal server error!!!!!" });
  }
});

router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //no admin can vote
  //user can only vote once

  candidateId = req.params.candidateId;
  userId = req.jwtUserData.id;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (user.isVoted) {
      return res.status(400).json({ message: "you have already voted !" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin is not allowed" });
    }

    //update vote
    candidate.votes.push({ user: userId});
    candidate.voteCount++;
    await candidate.save();

    //update user document
    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "voted succesfully" });
  } catch (err) {
    res.status(500).json({ err: "internal server error!!!!!" });
  }
});

//vote count

router.get("/vote/count",async(req,res)=>{
  try{
    //find all candidates and sort them by votecount in dec order
    const candidate = await Candidate.find().sort({voteCount:'desc'})

    //map the candidate to only return their name and votecount

    const record = candidate.map((data)=>{
      return {
        party:data.party,
        count:data.count
      }
    })
    console.log(record)
    return res.status(200).json(record)
  }
  catch (err) {
    res.status(500).json({ err: "internal server error!!!!!" });
  }
  
})

router.get("/candidateList",async(req,res)=>{
  try{

      const candidateList = await Candidate.find({}, 'name party -_id');
      res.status(200).json(candidateList)
  }
  catch(err){
    res.status(500).json({ err: "internal server error !!!!" });
  }
})

module.exports = router;
