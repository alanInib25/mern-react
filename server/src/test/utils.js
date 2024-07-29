//hash
const { hashPass } = require("../utils/handlePass.js");
//model
const User = require("../models/users.model.js");

const data = {
  users: [
    {
      name: "test1",
      email: "test1@algo.cl",
      password: "asdasd",
    },
    {
      name: "test2",
      email: "test2@algo.cl",
      password: "asdasd",
    },
    {
      name: "test3",
      email: "test3@algo.cl",
      password: "asdasd",
    },
  ],
  user: {
    name: "test4",
    email: "test4@algo.cl",
    password: "asdasd",
  },
  notUsersValues: {
    name: "",
    email: "",
    password: "",
  },
};

const saveUser = async (user) => {
  try {
    await new User({
      ...user,
      password: await hashPass(user.password),
    }).save();
  } catch (error) {
    console.log(error);
  }
}


const saveUsers = async (users) => {
  try{
    await User.insertMany(users);
  } catch(error){
    console.log(error);
  }
};
module.exports = { data, saveUser, saveUsers };
