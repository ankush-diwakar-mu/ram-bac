import user from "../models/user.model.js"

export const demo = async(req, res) =>{
try{

    const page = Math.max(parseInt(req.query.page))

    const limit = Math.min(Math.max(parseFloat(req.query.limit)))    
    const skip = (pagg-1)*limit

    const user = await user.find().select("-password")
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)

    const totalUsers = await User.countDocuments()

    const totalpages = Math.ceil(totalUsers/limit)

    res.status(200).json({
        success:true,
        pagination:{
            totalUsers,
            totalpages,
            currentPage:page,
            limit,
            hasnextpage:page<totalpages,
            hasprevpage:page>1
        },
        count :user.length,
        users

    })

}catch(error){
    res.status(500).json({
        success:false,
        message:error.message
    })
}
}