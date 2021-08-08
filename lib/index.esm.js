/*!
* tMind-Svr v2.2.8
* (c) 2021-2022  Smpoo soft Co. Shanghai China
* Released under the MIT License.
* Author: David
* CreateDate: 2021-03-05
* LastBuild: 2021-08-08 10:05:29
*/
import{tEcho as t,tDate as o}from"tmind-core";const s=()=>(t("消息显示","消息","SUCC"),t(o().format(),"日期","INFO"),`hello ${o().format("YYYY-MM-DD hh:mi:ss.ms")}`),a=()=>"test function";export{s as func1,a as func2};
