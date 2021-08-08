/*!
* tMind-Svr v2.2.10
* (c) 2021-2022  Smpoo soft Co. Shanghai China
* Released under the MIT License.
* Author: David
* CreateDate: 2021-03-05
* LastBuild: 2021-08-09 05:48:58
*/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).tmindSvr=t()}(this,(function(){"use strict";const e=require("../base/index"),t=require("koa"),s=require("../base/index");return{KoaSvr:class extends e{constructor(e){super(e),this.#app=new t,this.#app.use((async(e,t)=>{e.body="测试",await t()}))}#app;start(){this.#app.listen(super.config.port),super.start()}},DbSvr:class extends s{constructor(e){super(e)}}}}));
