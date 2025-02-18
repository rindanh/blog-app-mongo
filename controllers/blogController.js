const service = require('../services/blogService')

const getAll = async (req, res, next) => {
    try {
        const userId = req.query.userId
        const blogs = await service.getAll(req.userId, userId)
        res.status(200).json({
            message: "Success get all blogs",
            data: {
                count: blogs.length,
                posts: blogs
            }
        })
    } catch (error) {
        next(error)
    }
}

// page-based
const getAllPageBased = async (req, res, next) => {
    try {
        const userId = req.query.userId;
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page

        // Extract filters and sort (using utility function or middleware)
        const { filters, sort } = extractQueryParams(req.query);

        // Call the service layer with pagination parameters
        const { blogs, pagination } = await service.getAllPageBased(req.userId, userId, filters, sort, page, limit);

        // Send response with pagination metadata
        res.status(200).json({
            message: "Success get all blogs",
            data: {
                count: blogs.length,
                posts: blogs
            },
            pagination
        });
    } catch (error) {
        next(error);
    }
};

// use utility function to save the logic below
// at ../utils/queryExtractor
const extractQueryParams = (query) => {
    const filters = {};
    const sort = {};

    // Extract filters
    if (query.category) {
        filters.category = query.category;
    }
    if (query.state) {
        filters.state = query.state;
    }
    // Add more filters as needed...

    // Extract sort parameters
    if (query.sortBy) {
        // need to validate the sortBy value also
        const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
        sort[query.sortBy] = sortOrder;
    } else {
        sort.publishedAt = -1; // Default sort
    }

    // Extract pagination parameters
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    return { filters, sort, page, limit };
};

// cursor-based
// GET /blogs?limit=5&cursor=64f1b2c3e4d5f6a7b8c9d0e1&direction=next
// GET /blogs?limit=5&cursor=64f1b2c3e4d5f6a7b8c9d0e1&direction=previous
// response
// {
//     "message": "Success get all blogs",
//     "data": {
//         "count": 5,
//         "posts": [
//             { /* blog 1 */ },
//             { /* blog 2 */ },
//             { /* blog 3 */ },
//             { /* blog 4 */ },
//             { /* blog 5 */ }
//         ]
//     },
//     "pagination": {
//         "nextCursor": "64f1b2c3e4d5f6a7b8c9d0e1",
//         "previousCursor": "64f1a2b3c4d5e6f7a8b9c0d1",
//         "hasNextPage": true,
//         "hasPreviousPage": true,
//         "limit": 5
//     }
// }
const getAllCursorBased = async (req, res, next) => {
    try {
        const userId = req.query.userId;
        const cursor = req.query.cursor || null; // Cursor (e.g., last _id from the previous request)
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
        const direction = req.query.direction || 'next'; // Default to 'next' direction

        // Extract filters and sort (using utility function or middleware)
        const { filters, sort } = extractQueryParams(req.query);

        // Call the service layer with cursor-based pagination parameters
        const { blogs, pagination } = await service.getAllCursorBased(req.userId, userId, filters, sort, cursor, limit, direction);

        // Send response with pagination metadata
        res.status(200).json({
            message: "Success get all blogs",
            data: {
                count: blogs.length,
                posts: blogs
            },
            pagination
        });
    } catch (error) {
        next(error);
    }
};



const getByPostId = async (req, res, next) => {
    try {
        const postId = req.params.postId
        const blogs = await service.getByPostId(postId, req.userId)
        res.status(200).json({
            message: "Success get blog by post id",
            data: blogs
        })
    } catch (error) {
        next(error)
    }
}

const create = async (req, res, next) => {
    try {
        const {title, tags, body} = req.body
        const userId = req.userId
        const post = await service.create(title, tags, userId, body)
        res.status(200).json({
            message: "Post is sucessfully created",
            post
        })
    } catch (error) {
        next(error)
    }
}

const publish = async (req, res, next) => {
    try {
        const postId = req.params.postId
        const userId = req.userId
        const post = await service.publish(postId, userId,)
        res.status(200).json({
            message: "Post is sucessfully set to public",
            post
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAll,
    create,
    publish,
    getByPostId
}