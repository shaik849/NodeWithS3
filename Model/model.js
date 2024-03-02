const mongoose = require('mongoose');

// Define the schema
const ImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },

  caption :{
    type : String,
    required: true,
  }
  // You can add more fields if needed
}, {timestamps: true});

// Create the model
const ImageModel = mongoose.model('Image', ImageSchema);

module.exports = ImageModel;
