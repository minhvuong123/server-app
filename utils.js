const jwt = require('jsonwebtoken');

const configToken = {
  secretToken: "kiwi",
  refreshTokenSecret: "kiwi_refresh",
  tokenLife: 1000*60*24
} 

function verifyJwtToken(token, secretKey) {
  return new Promise((resolve, reject) => {
      jwt.verify(token, secretKey, async (err, decoded) => {
          if (err) {
            console.log("Token expire or it's something wrong!")
            reject(undefined)
          } 
          resolve(decoded);
      })
  })
}

function removeAccents(str) {
  var AccentsMap = [
    "aàảãáạăằẳẵắặâầẩẫấậ",
    "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
    "dđ", "DĐ",
    "eèẻẽéẹêềểễếệ",
    "EÈẺẼÉẸÊỀỂỄẾỆ",
    "iìỉĩíị",
    "IÌỈĨÍỊ",
    "oòỏõóọôồổỗốộơờởỡớợ",
    "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
    "uùủũúụưừửữứự",
    "UÙỦŨÚỤƯỪỬỮỨỰ",
    "yỳỷỹýỵ",
    "YỲỶỸÝỴ"    
  ];
  for (var i=0; i<AccentsMap.length; i++) {
    var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
    var char = AccentsMap[i][0];
    str = str.replace(re, char);
  }
  return str;
}

module.exports = {
 rootPath: __dirname,
 configToken,
 verifyJwtToken,
 removeAccents
}