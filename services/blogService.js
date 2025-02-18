const blogModel = require('../models/blogs')
const userModel = require('../models/users')
const { createError } = require('../middlewares/errors')

const getAll = async (currentUserId, requestedUserId) => {
    let query = {
        state: 'public'
    }

    console.log("current", currentUserId)
    console.log("requested user id", requestedUserId)

    if (requestedUserId) {
        query.user_id = requestedUserId
    }

    if (currentUserId && !requestedUserId) {
        query = {
            $or: [
                { state: 'public'},
                { user_id: currentUserId }
            ]
        }
    }
    if (requestedUserId && currentUserId && currentUserId === requestedUserId) {
        query = {
            user_id: requestedUserId
        }
    }
    
    console.log("final query: ", query)
    const blogs = await blogModel.find(query)
        .populate(["user_id"])
        .sort(({effectiveDate: -1}))
    return blogs
}

// original code
// const getAll = async (currentUserId, requestedUserId) => {
//     let query = {
//         state: 'public'
//     }

//     console.log("current", currentUserId)
//     console.log("requested user id", requestedUserId)

//     if (requestedUserId) {
//         query.user_id = requestedUserId
//     }

//     if (currentUserId && !requestedUserId) {
//         query = {
//             $or: [
//                 { state: 'public'},
//                 { user_id: currentUserId }
//             ]
//         }
//     }
//     if (requestedUserId && currentUserId && currentUserId === requestedUserId) {
//         query = {
//             user_id: requestedUserId
//         }
//     }

//     const blogs = await blogModel.find(query)
//     .populate([
//         "user_id"
//     ])
//     .sort({publishedAt: -1})
//     return blogs
// }

// page-based
// other alternatives: https://github.com/sixtusiwuchukwu/node.js-pagination-middleware/blob/master/server.js
const getAllPageBased = async (currentUserId, requestedUserId, filters = {}, sort = {}, page = 1, limit = 10) => {

    let query = {
        state: 'public'
    };

    console.log("current", currentUserId);
    console.log("requested user id", requestedUserId);

    if (requestedUserId) {
        query.user_id = requestedUserId;
    }

    if (currentUserId && !requestedUserId) {
        query = {
            $or: [
                { state: 'public' },
                { user_id: currentUserId }
            ]
        };
    }

    if (requestedUserId && currentUserId && currentUserId === requestedUserId) {
        query = {
            user_id: requestedUserId
        };
    }

    // Apply additional filters
    if (filters) {
        query = { ...query, ...filters };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch paginated blogs
    const blogs = await blogModel.find(filters)
        .populate("user_id")
        .sort(sort)
        .skip(skip)
        .limit(limit);

    // Get the total count of blogs (without pagination)
    const totalBlogs = await blogModel.countDocuments(filters);

    // Calculate total pages
    const totalPages = Math.ceil(totalBlogs / limit);

    return {
        blogs,
        pagination: {
            totalBlogs,
            totalPages,
            currentPage: page,
            limit
        }
    };
};

// cursor-based
const getAllCursorBased = async (currentUserId, requestedUserId, filters = {}, sort = {}, cursor = null, limit = 10, direction = 'next') => {
    let query = { ...filters };

    // Apply cursor-based pagination
    if (cursor) {
        if (direction === 'next') {
            query._id = { $gt: cursor }; // Fetch records after the cursor
        } else if (direction === 'previous') {
            query._id = { $lt: cursor }; // Fetch records before the cursor
        }
    }

    // Fetch blogs with cursor-based pagination
    const blogs = await blogModel.find(query)
        .populate("user_id")
        .sort(sort)
        .limit(limit + 1); // Fetch one extra record to determine if there's a next page

    // Determine if there's a next or previous page
    const hasNextPage = blogs.length > limit;
    const hasPreviousPage = !!cursor; // If a cursor was provided, there's a previous page

    // Remove the extra record if it exists
    if (blogs.length > limit) {
        blogs.pop();
    }

    // Get the next and previous cursors
    const nextCursor = blogs.length > 0 ? blogs[blogs.length - 1]._id : null;
    const previousCursor = blogs.length > 0 ? blogs[0]._id : null;

    return {
        blogs,
        pagination: {
            nextCursor,
            previousCursor,
            hasNextPage,
            hasPreviousPage,
            limit
        }
    };
};



const getByPostId = async (postId, userId) => {

    let user
    
    if (userId) {
        user = await userModel.findOne({
            _id: userId
        })
        if (!user) {
            throw createError(400, null, "User does not exist")
        }
    }

    let query = {
        _id: postId,
        $or: [
            { state: 'public'}
        ]
    }
    if (userId) {
        query.$or.push(
            { user_id: userId }
        )
    }
    const blogs = await blogModel.findOne(query)
    .populate([
        "user_id"
    ])
    .sort({createdAt: -1})
    if (!blogs) {
        throw createError(404, null, "Blog post does not exist")
    }
    return blogs
}

const create = async (
    title, 
    tags,
    userId,
    body
) => {
    const tag = tags ? tags.split(",") : null;
    const user = await userModel.findOne({
        _id: userId
    })
    if (!user) {
        throw createError(400, null, "User does not exist")
    }
    const post = await blogModel.create({
        title,
        tags: tag,
        user_id: userId,
        body
    })

    return {
        id: post._id,
        title: post.title,
        state: post.state
    }
}

const publish = async (postId, userId) => {
    const user = await userModel.findOne({
        _id: userId
    })
    if (!user) {
        throw createError(400, null, "User does not exist")
    }

    const post = await blogModel.findOne({
        _id: postId
    })
    if (!post) {
        throw createError(400, null, "Post does not exist")
    }

    if (post.user_id !== userId) {
        throw createError(400, null, "User is not authorized")
    }

    post.state = 'public'
    post.publishedAt = new Date()
    post.effectiveDate = post.publishedAt
    post.save()
    return {
        id: post._id,
        title: post.title,
        state: post.state
    }
}

module.exports = {
    getAll,
    getByPostId,
    create,
    publish
}