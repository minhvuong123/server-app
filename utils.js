const jwt = require('jsonwebtoken');

const configToken = {
  secretToken: "kiwi",
  refreshTokenSecret: "kiwi_refresh",
  tokenLife: 60
} 

function verifyJwtToken(token, secretKey) {
  return new Promise((resolve, reject) => {
      jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
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