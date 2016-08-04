var testUtils = require('../../utils'),
    should = require('should'),
    sinon = require('sinon'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    uid = require('../../../server/utils').uid,
    InvitesAPI = require('../../../server/api/invites'),
    mail = require('../../../server/api/mail'),
    context = testUtils.context,

    sandbox = sinon.sandbox.create();

describe('Invites API', function () {
    before(testUtils.teardown);
    afterEach(testUtils.teardown);

    beforeEach(function () {
        sandbox.stub(mail, 'send', function () {
            return Promise.resolve();
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    //@TODO: group this file into password, invite, setup?
    describe('Invite Flow', function () {
        beforeEach(testUtils.setup('owner:pre', 'perms:init'));

        it.only('invite somebody', function (done) {
            InvitesAPI.addInvite({
                email: 'kate@ghost.org'
            }, {context: {user1: {name: 'Owner', email: 'katharina.irrgang@gmail.com'}, user: 1}})
                .then(function () {
                    done();
                }).catch(done);
        });
    });
});
