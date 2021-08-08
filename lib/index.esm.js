/*!
* tMind-Svr v2.2.10
* (c) 2021-2022  Smpoo soft Co. Shanghai China
* Released under the MIT License.
* Author: David
* CreateDate: 2021-03-05
* LastBuild: 2021-08-09 05:48:58
*/
const e=require("../base/index"),s=require("koa"),r=require("../base/index");var t={KoaSvr:class extends e{constructor(e){super(e),this.#app=new s,this.#app.use((async(e,s)=>{e.body="测试",await s()}))}#app;start(){this.#app.listen(super.config.port),super.start()}},DbSvr:class extends r{constructor(e){super(e)}}};export default t;
