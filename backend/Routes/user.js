let express = require('express'),
    router = express.Router(),
    userService = require('../Services/user'),
    auth = require('../middleware/auth'),
    multer  = require('multer');

router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
})  

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/public/userpic')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
})
   
var upload = multer({ storage: storage })

router.post('/userQuery', userService.userQuery);
router.post('/contact', userService.contact); 
router.post('/signup', userService.signup);
router.post('/login', userService.login);
router.post('/forgotPassword', userService.forgotPassword);
router.post('/articles', userService.articles);
router.post('/getArticles', userService.getArticles);
router.post('/languages', userService.language);
router.post('/userPlan', userService.userPlan);
router.post('/plan', userService.plan);
router.post('/profile', auth.verifyToken, userService.user);
router.post('/editProfile', upload.single('userpic'), auth.verifyToken, userService.editProfile);
router.post('/transaction', auth.verifyToken, userService.transaction);
router.post('/downloadReceipt', auth.verifyToken, userService.downloadReceipt);
router.post('/cnfrmPassword', userService.cnfrmPassword);
router.post('/reviewNGenerate', auth.verifyToken, userService.reviewNGenerate);
router.post('/industry', userService.industry);

module.exports = router;


