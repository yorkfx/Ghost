var ghostBookshelf = require('./base'),
    globalUtils = require('../utils'),
    crypto = require('crypto'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    Invite,
    Invites;

Invite = ghostBookshelf.Model.extend({
    tableName: 'invites',

    toJSON: function (options) {
        options = options || {};

        var attrs = ghostBookshelf.Model.prototype.toJSON.call(this, options);
        delete attrs.token;
        return attrs;
    },

    roles: function roles() {
        return this.belongsToMany('Role');
    }
}, {
    orderDefaultOptions: function orderDefaultOptions() {
        return {};
    },

    processOptions: function processOptions(options) {
        return options;
    },

    filterData: function filterData(data) {
        var permittedAttributes = this.prototype.permittedAttributes(),
            filteredData;

        permittedAttributes.push('roles');
        filteredData = _.pick(data, permittedAttributes);

        return filteredData;
    },

    add: function add(data, options) {
        //@TODO: add bookshelf defaults?
        data.expires = Date.now() + globalUtils.ONE_WEEK_MS;
        data.status = 'pending';

        var hash = crypto.createHash('sha256'),
            text = '';

        hash.update(String(data.expires));
        hash.update(data.email.toLocaleLowerCase());
        text += [data.expires, data.email, hash.digest('base64')].join('|');
        data.token = new Buffer(text).toString('base64');

        var roles = data.roles, invite;

        delete data.roles;

        return ghostBookshelf.Model.add.call(this, data, options)
            .then(function (_invite) {
                invite = _invite;

                return Promise.resolve(roles)
                    .then(function then(roles) {
                        roles = _.map(roles, function mapper(role) {
                            if (_.isString(role)) {
                                return parseInt(role, 10);
                            } else if (_.isNumber(role)) {
                                return role;
                            } else {
                                return parseInt(role.id, 10);
                            }
                        });

                        return invite.roles().attach(roles, options);
                    });
            })
            .then(function () {
                return invite;
            });
    }
});

Invites = ghostBookshelf.Collection.extend({
    model: Invite
});

module.exports = {
    Invite: ghostBookshelf.model('Invite', Invite),
    Invites: ghostBookshelf.collection('Invites', Invites)
};

