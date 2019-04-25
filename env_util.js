const minimist = require('minimist');

//开发环境、正式环境
const DEVELOPMENT ="development";
const PRODUCTION ="production";

function getEnv(){
    let args = minimist(process.argv.slice(2));
//命令行参数||环境变量||默认值
    return args.env || process.env.NODE_ENV || DEVELOPMENT;
}
function isDevelopment(){
    return DEVELOPMENT === getEnv();
}

exports.getEnv=getEnv;
exports.isDevelopment=isDevelopment;
