var errors ={
    "invalid_parameters"   :    [100,'Invalid Parameters'],
    "server_error"         :    [200,'Server Error'],
    "account_already_exist":    [300,"Accound Already Exist"],
    "already_subscribed"   :    [350,"Already subscribe to this platform"],
    "password_check"       :    [400,"password must contain one capital letter,Special charactor and numerical value"],
    "password_length"      :    [450,"password length should be greater than 8"],
    "email_invalid"        :    [500,"Email is not valid or disposal"],
    "email_not_sent"       :    [600,"Otp is not sent on given email address"],
    "otp_invalid"          :    [700,"Otp is invalid or used"],
    "account_doesnot_exist":    [800,"account doesnot exist"]
}

module.exports = errors;