let jwt = require('jsonwebtoken');
// util = require('util');
// config = require('config').config;

let token = jwt.sign({ dt: new Date().getTime() }, "6YVP5O7L44ttwIMJVg34OehKwdEpnF8C");

var forgetpassword = {
	from: "ContentWiz<admin@contentwiz.com>",
	subject:"ContentWiz | Reset Password",	
	text:`<div class="payment" style="border:1px solid rgb(224, 224, 224); background-color: rgb(255, 255, 255); padding:20px; margin:0 auto; max-width:600px;">
    <div class="heading" style="display:inline-block; width:100%; padding:0px; margin:0px;">
      <div class="banner_left_div" style="width:100%;">
        <div class="banner_img">
          <a href="#">
            <img style="margin:0 auto; width: 100px;" src="public/contentwiz.png" alt="logo"/>
          </a>
        </div>
      </div>
    </div>
    <div class="social-login">
      <table style="width:100%; border-collapse: collapse;">
        <tr>
          <td align="center">
            <table style="max-width:600px;" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
              <tbody>
                <tr>
                  <td align="center">
                    <table>
                      <tbody>
                        <tr>
                          <td style="max-width: 600px;">
                            <span style="color: #434343; display: block; text-align: left; font-family: Open Sans, Helvetica, Arial sans-serif; font-weight: 600; margin-top: 45px;">
                              <h2 style="font-size: 25px;">Reset Password</h2>
                              <p style="color: #777777; display: block; text-align: left; font-family: Open Sans, Helvetica, Arial sans-serif; margin-top: 25px; font-size: 16px; line-height: 28px; font-weight: normal;">You have requested to reset your password. Please click on the 'Reset Password' link to reset your password.</p></span>
                            </td>
                          </tr>
                          <tr>
                            <td style="border-radius: 30px; max-width: 600px;" align="center">
                              <a href="http://52.27.53.102:5452/contentwiz/user/confirm?token=${token}" target="_blank" style="font-size: 15px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 30px; background-color: #de2121; padding: 15px 30px; border: 1px solid #de2121; display: block;margin-top: 20px; width: 200px;">RESET PASSWORD</a>
                            </td>    
                          </tr>
                          <tr>
                           <td style="color: #777777; display: block; text-align: left; font-family: Open Sans, Helvetica, Arial sans-serif; margin-top: 35px; font-size: 16px; line-height: 28px; margin-bottom: 20px;">This password link is only valid till next 5 minutes.</td>
                         </tr>
                         <tr>
                          <td style="color: #777777; display: block; text-align: left; font-family: Open Sans, Helvetica, Arial sans-serif; margin-top: 10px; font-size: 16px; line-height: 28px;margin-bottom: 25px;">
                            Thanks for using ContentAi!
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color: #eeeeee; width: 100%"></td>
                        </tr>
                        <tr>
                          <td style="max-width: 600px;">
                            <p style="color: #808080; display: block; text-align: left; font-family: Open Sans, Helvetica, Arial sans-serif; margin-top: 25px; font-size: 16px; line-height: 28px;">If the above link is not working then please copy and paste this link into your browser instead:</p>
                            <a href=""></a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </div>`
	 
}

module.exports ={
	forgetpassword : forgetpassword
}