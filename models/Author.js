/**
 * Author model
 */

module.exports = (bookshelf) => {
	return bookshelf.model('Author', {
		tableName: 'authors',
		books() {
			return this.hasMany('Book');
		},
	}, {
		async fetchById(id, fetchOptions = {}) {
			return await new this({ id }).fetch(fetchOptions);
		},
	});
}
