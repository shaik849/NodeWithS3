const ImageModel = require('../Model/model');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require("crypto");

const bucketName = process.env.BUCKET_NAME
const regionName = process.env.REGION
const accessKey = process.env.ACCESS_KEY
const securityKey = process.env.ACCESS_SECRATE_KEY
const randomImg = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
const s3 = new S3Client({
    credentials : {
        accessKeyId : accessKey,
        secretAccessKey : securityKey,

    },
    region : regionName
})
const uploadImg =  async (req, res) => {
    try{
   const imageName = randomImg();
  const params = {
    Bucket : bucketName,
    Key : imageName,
    Body : req.file.buffer,
    ContentType : req.file.mimetype,
  }

  const command = new PutObjectCommand(params)

  const data = new ImageModel({
      caption : req.body.description,
      imageUrl : imageName,
  })

  await data.save();
  await s3.send(command)

  return res.status(200).json({ data: data });
}
catch (err) {
    console.log(err)
    return res.status(500).json({ err: err})
}
}

const getImage = async (req, res) =>{
    try{
        const getData = await ImageModel.find({})
       for(const imageUrl of getData ){
        const params = {
            Bucket : bucketName,
            Key : imageUrl.imageUrl,
          }
        
          const command = new GetObjectCommand(params)
          const url = await getSignedUrl(s3, command)
          imageUrl.imageUrl = url
       }

       return res.status(200).json({data : getData})
    }
    catch(err){
        console.log(err)
        return res.status(500).json({ err: err})
    }
}

const deleteImg = async (req, res) =>{
    try {
       const id = req.params.id
        const data = await ImageModel.findByIdAndDelete({ _id: id });
        if (!data) {
          console.error('Document not found in MongoDB');
          return res.status(404).json({ err: 'not found' });
        }

        const params = {
            Bucket : bucketName,
            Key : data.imageUrl,
          }
      
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
      
        return res.status(200).json({ data: 'successfully deleted' });
      } catch (err) {
        console.error('Error deleting image:', err);
        return res.status(500).json({ err: err.message });
      }
      
}

module.exports = {
  uploadImg,
  getImage,
  deleteImg
};
