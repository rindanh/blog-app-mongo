
const mongoose = require('mongoose')
const shortid = require('shortid')

const blogSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100
    },
    tags: [{
        type: String,
        required: true,
        default: []
    }],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    publishedAt: {
        type: Date,
    },
    effectiveDate: {
        type: Date,
        default: Date.now
    },
    state: {
        type: String,
        default: 'draft',
        enum: ['public', 'private', 'draft']
    },
    user_id: {
        type: mongoose.Schema.Types.String,
        ref: "users"
    },
    read_count: {
        type: Number,
        required: true,
        default: 0
    },
    reading_time: {
        type: Number
    },
    body: {
        type: String,
        required: false
    }
})

blogSchema.pre('save', function (next) {
    this.updatedAt = new Date(); 
    next();
});

const blogModel = mongoose.model("blogs", blogSchema)
module.exports = blogModel
