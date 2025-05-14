import {Schema,model} from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import crypto from 'crypto';

const userSchema=new Schema({
  fullName:{ //validation  in database before inserting
    type:'String',
    required:[true,'Name is required'],
    minLength:[5,'Name must br atleast 5 character'],
    maxLength: [50,'Name should be less than 50 characters'],
    lowercase:true,
    trim:true, //starting ending spaces remove
  },
  email:{
    type:'String',
    required:[true,'Email is Required'],
    lowercase:true,
    trim:true,
    unique:true, //remove duplicate email id
    
  },
  password:{
    type:'String',
    required:[true, 'password is required'],
    minLength:[8,'Password must be atleast 8 characters'],
    select:false,//dont show to the end user
  },
  avatar:{  //photo se related
    public_id:{
      type:'String'
    },
    secure_url:{
      type:'String'//store image related information
    }
  },
  role:{
    type:'String',
    enum:['USER','ADMIN'],//tell the type of user
    default:'USER',
  },
  forgotPasswordToken:String,
  forgotPasswordExpiry: Date,
  subscription:{
    id:String,
    status:String,
  }
},{
  timestamps:true  //by default puch hota jayeeee
});

userSchema.pre('save',async function(next){  //databse mai chheze encrpt karke store hongi
  if(!this.isModified('password')){
    return next();
  }
  this.password=await bcrypt.hash(this.password,10);
})//database mai save karne se phle yeh function kuch kaam karke dega

userSchema.methods={  //generating JWT TOKEN
  
  generateJWTToken: function () {
    return jwt.sign(
      {
        id: this._id,
        email: this.email,
        subscription: this.subscription,
        role: this.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  },
  comparePassword: async function(plainTextPassword){
    return await bcrypt.compare(plainTextPassword,this.password);
  },
  generatePasswordResetToken : async function(){
    const resetToken=crypto.randomBytes(20).toString('hex'); //predefined methods
        this.forgotPasswordToken=crypto   //encrypt karke dalenge
          .createHash('sha256')
          .update(resetToken)
          .digest('hex');

this.forgotPasswordExpiry=Date.now()+15*60*1000; //15min from  now
return resetToken;

  }
}
const  User=model('User',userSchema); //instance of user model

export default User;