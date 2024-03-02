const router = require('express').Router();
const controllers = require('../Controller/controller')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('image'), controllers.uploadImg)
router.get('/', controllers.getImage)
router.delete('/:id', controllers.deleteImg)

module.exports = router