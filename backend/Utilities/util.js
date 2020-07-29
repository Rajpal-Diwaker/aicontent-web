let fs = require("fs"),
  config = require("./config").config,
  mustache = require("mustache"),
  nodemailer = require("nodemailer"),
  templates = require("../Utilities/templates"),
  crypto = require("crypto"),
  secret = "6YVP5O7L44ttwIMJVg34OehKwdEpnF8C",
  path = require('path'),
  ThumbnailGenerator = require('video-thumbnail-generator').default;

let uploadFolder = "/var/www/html/tpm/uploads/";
let usersImageUrl = uploadFolder + "users/";
let webUrlRoot = "http://localhost";
let uploadsFolder = "http://localhost";
let auth_key = config.auth_key
let addBasePath = url => {
  if (!url) {
    return "";
  }
  if (!/^(f|ht)tps?:\/\//i.test(url)) {
    url = uploadsFolder + url;
  }
  return url;
};
const errHandler = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(err => {
        res.status(401).send({ "message": "something went wrong" })
      });
  };

let send_notification = (registration_token, title, body, msg) => {
  var FCM = require('fcm-node');
  var serverKey = config.FCM_SERVER_KEY
  var fcm = new FCM(serverKey);

  var message = {
    to: registration_token,
    collapse_key: 'your_collapse_key',

    notification: {
      title: title,
      body: body
    },

    data: {
      title: title,
      msg: body,
      body: body
    }
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
}

let randomValueBase64 = len => {
  return crypto
    .randomBytes(Math.ceil((len * 3) / 4))
    .toString("base64") // convert to base64 format
    .slice(0, len) // return required number of characters
    .replace(/\+/g, "0") // replace '+' with '0'
    .replace(/\//g, "0"); // replace '/' with '0'
};
// Define Error Codes
let statusCode = {
  OK: 200,
  FOUR_ZERO_ONE: 401,
  TWO_ZERO_ONE: 201,
  TWO_ZERO_TWO: 202,
  INTERNAL_SERVER_ERROR: 400,
  FOUR_ZERO_ZERO: 400,
  BAD_REQUEST: 404,
  FIVE_ZERO_ZERO: 500,
  THREE_ZERO_ZERO: 300,
  THREE_ZERO_ONE: 301,
  THREE_THREE_THREE: 333,
  DELERROR: 999
};
// Define Error Messages
let statusMessage = {
  PARAMS_MISSING: "Mandatory Fields Missing",
  SERVER_BUSY: "Our Servers are busy. Please try again later.",
  PAGE_NOT_FOUND: "Page not found",
  SUCCESS: "Success.",
  ERROR: "Error",
  REMOVED: "Removed.",
  USER_ALREADY_EXITS: "User already exists.",
  USER_NOT_EXITS: "User does not exists.",
  ITEM_NOT_EXITS: "Item does not exists.",
  INVALID_TOKEN: "User authentication failed.",
  OLD_TOKEN: "Please provide new token",
  INVALID_PASS: "Invalid password.",
  UNABLETOSEND: "Unable to send OTP, please try after sometime.",
  TABLE_NOT_EXISTS: "table not exists please add new table.",
  INVALID_OTP: "Invalid OTP for mobile :",
  RESEND_OTP: "Please resend OTP.",
  VERIFY_NUMBER: "Please verify your mobile number.",
  STATUS_UPDATED: "User profile updated successfully.",
  UPDATED: "Updated successfully.",
  PASSWORD_CHNAGED: "User password changed successfully.",
  DB_ERROR: "Database related error.",
  EMAIL_SENT: "An email with generate new password link has been sent on registered email.",
  USER_ADDED: "User signup successfully.",
  LOGIN_SUCCESSFULLY: 'Login successfully',
  PWD_NOT_MATCH: 'Passwords do not match',
  GET_BACK_SOON: 'We will get back to you soon',
  ARTICLE_SAVED_SUCCESS: 'Article saved Successfully',
  ARTICLE_FETCHED_SUCCESS: 'Article fetched Successfully',
  LANGUAGE_FETCHED_SUCCESS: 'Language fetched Successfully'
};
let mailModule = nodemailer.createTransport(config.EMAIL_CONFIG);
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: "smtp.postmarkapp.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'test.techugo@gmail.com',
    pass: 'LUCKY@005' // generated ethereal password
  }
})

// for util
//send mail 
let sendEmail = (data) => {
  var mailOptions = {
    from: templates.forgetpassword.from,
    to: data.email,
    subject: templates.forgetpassword.subject,
    html: templates.forgetpassword.text
  };
  mailModule.sendMail(mailOptions);
}

let sendEmailVerificationMail = (data) => {
  var url = '52.27.53.102:8989'
  var env = require("../Utilities/environment.js")
  if (env.environment == "live") {
    var url = '13.234.89.134:6262'
  }

  var html = `<p>Hi ,</p> <p>${data.password}.<p>Thanks</p> <p> Regards,
  Qause Team</p>`
  if (data.type == 1) {
    var html = `<p>Hi ,</p> <p> Greetings from Qause! </p> <p>Your one time password is ${data.password}.<p>Thanks for registering with us.</p> <p> Qause Team.</p>`
  }
  if (data.type == 2) {
    var html = `Hi user,<br><br>Please follow the link to recover the password.<a target='_blank' href='http://${url}/tpm/verifyForgotLink?email=${data.email}&token=${data.token}'>Recover Password</a><br> If it does not work please copy and past link on browser<br><br>Thanks,<br> Qause Team.`
  }
  var mailOptions = {
    from: templates.ic_forgetpassword.from,
    to: data.email,
    subject: templates.ic_forgetpassword.subject,
    html: html
  };
  transporter.sendMail(mailOptions);
}
let validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
let im_forgetpassword = data => {
  var mailOptions = {
    from: templates.im_forgetpassword.from,
    to: data.email,
    subject: templates.im_forgetpassword.subject,
    html: mustache.render(templates.im_forgetpassword.text, data)
  };
  mailModule.sendMail(mailOptions);
};
let generateToken = () => {
  return Date.now() + Math.floor(Math.random() * 99999) + 1000;
};
let generateUid = () => {
  const Chance = require("chance");
  const chance = new Chance(Date.now() + Math.random());
  let randomStr = chance.string({
    length: 25,
    pool: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  });
  return randomStr;
};
let entryDirectory = function (x) {
  var dir = usersImageUrl + x;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
};
let daysInThisMonth = function () {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
};
let daysOverInThisMonth = function () {
  let now = new Date();
  let then = new Date(now.getFullYear(), now.getMonth(), 01);
  return Math.round((now - then) / (1000 * 60 * 60 * 24));
};


let createThumbnail = (type, videoFile) => {
  let videoPath = {};
  if (type == 'image') {

    videoPath['sourcePath'] = path.join(__dirname, '..', 'public', 'student_talent_images', videoFile);
    videoPath['thumbnailPath'] = path.join(__dirname, '..', 'public', 'student_talent_images');
  }
  if (type == 'video') {

    videoPath['sourcePath'] = path.join(__dirname, '..', 'video', videoFile);
    videoPath['thumbnailPath'] = path.join(__dirname, '..', 'thumbnail');
  }

  return new Promise((resolve, reject) => {
    const tg = new ThumbnailGenerator(videoPath);
    tg.generateOneByPercentCb(90, (err, result) => {
      resolve(result)
    });
  })
}

let sendReceiptMail = (data) => {
  var mailOptions = {
    from: templates.ic_forgetpassword.from,
    to: data.email,
    subject: data.subject,
    html: data.html
  };

  mailModule.sendMail(mailOptions);
}

let transform_image = async (image, name) => {
  var filename = name
  var typeMatch = image.match(/\.([^.]*)$/);
  var imageType = typeMatch[1].toLowerCase();
  var gm = require('gm')
    .subClass({ imageMagick: true });
  var MAX_WIDTH = 50
  var MAX_HEIGHT = 50
  gm(image).size(function (err, size) {
    var scalingFactor = Math.min(
      MAX_WIDTH / size.width,
      MAX_HEIGHT / size.height
    );
    var width = 500;
    var height = 500;
    this.resize(width, height)
      .toBuffer('png', function (err, buffer) {
        if (err) {
          console.log(err)
        } else {
          gm(buffer, 'image.png')
            .noise('laplacian')
            .write(path.join(__dirname, '..', 'thumbnail', `${filename}`), function (err) {
              if (err) {
                console.log(err);
              } else {
                return `${filename}`
              }
            });

        }
      })
  })
}
let messageSince = (dt) => {
  var startDate = new Date();
  var endDate = new Date(dt)
  var seconds = (startDate.getTime() - endDate.getTime()) / 1000;

  var minute = seconds / 60
  var txt = ""
  if (seconds < 60) {
    //just now
    txt = "Just now"
  } else if (minute > 60) {
    //hr
    let hr = Math.round(minute / 60)
    txt = hr + " hr"
    if (hr > 24) {
      // days
      let day = Math.round(hr / 24)
      txt = day + " day"
      if (day > 7) {
        let week = Math.round(day / 7)
        txt = week + " week"
        if (week > 1) {
          txt = week + " weeks"
        }
      }
    }

  } else {
    // min
    txt = Math.round(minute) + " min"
  }
  return txt
}
let sendOtpPhone = (data) => {
  let url = `http://msg.msgclub.net/rest/services/sendSMS/sendGroupSms?AUTH_KEY=${auth_key}&message=${data.msg}&senderId=${sender_id}&routeId=1&mobileNos=${data.username}&smsContentType=english`
  client.get(url, async function (data, response) {
  });
}

let gettime = (x) => {
  var today = new Date()
  var startYesterday = today.setDate(today.getDate() - x)

  var startFinal1 = new Date(startYesterday);
  let res = startFinal1.toISOString().split('T')
  var startFinal = res[0]
  var endFinal1 = new Date().toISOString().split('T')
  var endFinal = endFinal1[0] + ' 23:59:59'
  return { start_time: startFinal, end_time: endFinal };
}

let shorten_url = async url => {
  var TinyURL = require('tinyurl');
  const tiny_url = await TinyURL.shorten(url)
  return tiny_url
}

let onlyDate = () => {
  let dt = new Date().toISOString().split("T")[0]
  return dt
}

let dateDiff = (diff = 1) => {
  var dateObj = new Date();
  dateObj.setDate(dateObj.getDate() - diff);
  return dateObj
}

let htmlPdf = obj => {
  const { html } = obj

  var pdf = require('html-pdf');
  var options = { format: 'Letter' };

  return new Promise((resolve, reject) => {
    pdf.create(html, options).toBuffer( function(err, buffer) {
      if (err) reject(err);
      resolve(buffer);
    });
  })
}

let tokenize = text => {
  if(!text) return []
  let stopwords = ['difference', 'between', 'contrast', 'industry', 'journey', 'ways', 'go', 'went', 'way', 'this', 'is', 'a', 'an', 'and', 'it', 'in', 'on', 'trends', 'trend', 'should',
  'would', 'could', 'he', 'she', 'i', 'am', 'analysis', 'analytics', 'unleash', 'unleashes', 'to',
  'how', 'do', 'we', 'the', 'you', 'your', 'of', 'combined', 'power', 'can', 'which', 'has', 'been', 'have', 'for'];

  let words = text.split(/\W+/).filter(token => {
      token = token.toLowerCase();
      return token.length >= 2 && stopwords.indexOf(token) == -1;
  });
  return words
}

module.exports = {
  tokenize: tokenize,
  messageSince: messageSince,
  gettime: gettime,
  sendOtpPhone: sendOtpPhone,
  transform_image: transform_image,
  sendEmail: sendEmail,
  createThumbnail: createThumbnail,
  statusCode: statusCode,
  statusMessage: statusMessage,
  generateToken: generateToken,
  generateUid: generateUid,
  entryDirectory: entryDirectory,
  randomValueBase64: randomValueBase64,
  sendEmailVerificationMail: sendEmailVerificationMail,
  usersImageUrl: usersImageUrl,
  uploadFolder: uploadFolder,
  secret: secret,
  webUrlRoot: webUrlRoot,
  uploadsFolder: uploadsFolder,
  addBasePath: addBasePath,
  daysInThisMonth: daysInThisMonth,
  daysOverInThisMonth: daysOverInThisMonth,
  errHandler: errHandler,
  validateEmail: validateEmail,
  sendReceiptMail: sendReceiptMail,
  send_notification: send_notification,
  shorten_url: shorten_url,
  onlyDate: onlyDate,
  dateDiff: dateDiff,
  htmlPdf: htmlPdf
};