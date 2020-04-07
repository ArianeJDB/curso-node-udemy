const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')
//@desc     Get all bootcamps
//@route     GET /api/v1/bootcamps
//@access   public no auth
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        let query;
        // Copy req.query
        const reqQuery = { ...req.query }
        // FIelds to exclude
        const removeFileds = ['select', 'sort', 'page', 'limit']
        // Loop over removeFileds and delete them from reqQuey
        removeFileds.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery)
        //Create operators($gt, ·gte, $in, $lte)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => '$' + match)
        // Findfing resource
        query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')
        //Select Fileds
        if (req.query.select) {
                const fields = req.query.select.split(',').join(' ')
                query = query.select(fields)
        }
        // Sort
        if (req.query.sort) {
                const sortBy = req.query.sort.split(',').join(' ')
                query = query.sort(sortBy)
        } else {
                query = query.sort('-createdAt')
        }
        //Pagination
        const page = parseInt(req.query.page, 10) || 1
        const limit = parseInt(req.query.limit, 10) || 25
        const startIndex = (page - 1) * limit
        const endIndex = page * limit;
        const total = await Bootcamp.countDocuments();
        query = query.skip(startIndex).limit(limit)
        // Executgn query
        const bootcamps = await query
        // Pagination result
        const pagination = {}
        if (endIndex < total) {
                pagination.next = {
                        page: page + 1,
                        limit
                }
        }
        if(startIndex > 0){
                pagination.prev = {
                        page: page -1,
                        limit
                }
        }
        res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps })

})

//@desc     Get one bootcamp
//@route     GET /api/v1/bootcamps/:id
//@access   public no auth
exports.getBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)

        if (!bootcamp) {
                return new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        }
        res.status(200).json({ success: true, data: bootcamp })
})

//@desc     Create new bootcamp
//@route     POST /api/v1/bootcamps/
//@access   private auth
exports.createBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.create(req.body)
        res.status(201).json({
                success: true,
                data: bootcamp
        })
})
//@desc     Update  one bootcamp
//@route     PUT /api/v1/bootcamps/:id
//@access   private auth
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        if (!bootcamp) {
                return new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)

        }
        res.status(200).json({ success: true, data: bootcamp })

})

//@desc     Delete one bootcamp
//@route    DETELE /api/v1/bootcamps/:id
//@access   private auth
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)

        if (!bootcamp) {
                return new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)

        }
        bootcamp.remove()
        res.status(200).json({ success: true, data: {} })

})


//@desc     Get bootcamps within a radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   private auth
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
        const { zipcode, distance } = req.params

        //get lar/long from geocoder
        const loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude
        const lng = loc[0].longitude

        //Calc radius uing radians
        // Divide dist by radius of Earth
        //Earth Radius = 3,963 mi / 6,378 km
        const radius = distance / 3963

        const bootcamps = await Bootcamp.find({
                location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
        })
        res.status(200).json({
                success: true,
                count: bootcamps.length,
                data: bootcamps

        })
})