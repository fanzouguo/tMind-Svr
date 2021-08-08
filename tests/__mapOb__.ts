module.exports = (objStd, objTest, titleStd?: string) => {
	test('Compare the full keys between objecct dest vs std.', () => {
		expect(objTest).toMatchObject(objStd);
	});
};
