"use strict";

let envUtil = require("./env_util");
let env = envUtil.getEnv();
console.log("webpack的执行环境 %s", env);

module.exports = {
    mode: env,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/
            }
        ]
    },
    output: {
        //返回原始名字
        filename: '[name]'
    }
};