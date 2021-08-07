/* eslint-disable no-console */
// require('@babel/register')({
// 	presets: ['@babel/preset-env'],
// 	plugins: ['@babel/plugin-transform-runtime']
// // });
// import * as tmindSvr from '../lib/index.esm';
// // const { KoaSvr } = require('../lib/inidex');
// const { KoaSvr } = tmindSvr.default;

// const app = new KoaSvr(__dirname);

// console.log(app);
const aaa = require('../lib/inidex');

console.log(aaa('name'));