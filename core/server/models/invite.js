var ghostBookshelf = require('./base'),
    globalUtils = require('../utils'),
    crypto = require('crypto'),
    Invite,
    Invites;

Invite = ghostBookshelf.Model.extend({
    tableName: 'invites'
}, {
    add: function add(data, options) {
        data.expires = Date.now() + globalUtils.ONE_WEEK_MS;

        //@TODO: add filterData, filterOptions
        var hash = crypto.createHash('sha256'),
            text = '';

        hash.update(String(data.expires));
        hash.update(data.email.toLocaleLowerCase());
        text += [data.expires, data.email, hash.digest('base64')].join('|');
        data.token = new Buffer(text).toString('base64');

        var model = this.forge(data);
        return model.save(null, options);
    }
});

Invites = ghostBookshelf.Collection.extend({
    model: Invite
});

module.exports = {
    Invite: ghostBookshelf.model('Invite', Invite),
    Invites: ghostBookshelf.collection('Invites', Invites)
};

