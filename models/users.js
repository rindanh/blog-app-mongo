const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const shortid = require('shortid')

// _id bisa gaperlu didefine secara explicit
// kalo didefine explicit kaya gini hasilnya string. contoh: _id: 'wcsW7iVse'
// kalo ga didefine explicit, _id: ObjectId('67ac910ad79a495ce59c2601')
const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    fullname: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: { 
        type: String, 
        required: true
    },
    profilePicture: { type: String }
}, {
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password
            delete ret.__v
            return ret
        }
    },
    toObject: {
        transform: function (doc, ret) {
            delete ret.password
            delete ret.__v
            return ret
        }
    }
})


//before save

userSchema.pre("save", async function (next) {

    const user = this;
    const hash = await bcrypt.hash(user.password, 10);

    this.password = hash;
    next();

})


userSchema.methods.isValidPassword = async function (password) {

    const user = this;
    const compare = await bcrypt.compare(password, user.password);

    return compare;
    
}

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
