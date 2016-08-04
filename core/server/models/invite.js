var ghostBookshelf = require('./base'),
    globalUtils = require('../utils'),
    crypto = require('crypto'),
    Invite,
    Invites;

Invite = ghostBookshelf.Model.extend({
    tableName: 'invites',

    toJSON: function (options) {
        options = options || {};

        var attrs = ghostBookshelf.Model.prototype.toJSON.call(this, options);
        delete attrs.token;
        return attrs;
    }
}, {
    orderDefaultOptions: function orderDefaultOptions() {
        return {};
    },

    processOptions: function processOptions(options) {
        return options;
    },

    add: function add(data, options) {
        //@TODO: add bookshelf defaults?
        data.expires = Date.now() + globalUtils.ONE_WEEK_MS;
        data.status = 'pending';

        //@TODO: add filterData, filterOptions
        var hash = crypto.createHash('sha256'),
            text = '';

        hash.update(String(data.expires));
        hash.update(data.email.toLocaleLowerCase());
        text += [data.expires, data.email, hash.digest('base64')].join('|');
        data.token = new Buffer(text).toString('base64');

        return ghostBookshelf.Model.add.call(this, data, options);
    }
});

Invites = ghostBookshelf.Collection.extend({
    model: Invite
});

module.exports = {
    Invite: ghostBookshelf.model('Invite', Invite),
    Invites: ghostBookshelf.collection('Invites', Invites)
};

