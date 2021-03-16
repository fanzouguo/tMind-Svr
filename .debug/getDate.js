const frm = (str, len = 2) => {
	return `${str}`.padStart(len, '0');
};

module.exports = () => {
	const _dt = new Date();
	const _y = _dt.getFullYear();
	const _m = frm(_dt.getMonth() + 1);
	const _d = frm(_dt.getDate());
	const _hh = frm(_dt.getHours());
	const _mi = frm(_dt.getMinutes());
	const _ss = frm(_dt.getSeconds());
	return `${_y}-${_m}-${_d} ${_hh}:${_mi}:${_ss}`;
};
