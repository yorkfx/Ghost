var testUtils = require('../../utils'),
    should = require('should'),
    sinon = require('sinon'),
    _ = require('lodash'),
    Promise = require('bluebird'),
    uid = require('../../../server/utils').uid,
    InvitesAPI = require('../../../server/api/invites'),
    mail = require('../../../server/api/mail'),
    errors = require('../../../server/errors'),
    context = testUtils.context,

    sandbox = sinon.sandbox.create();

describe('Invites API', function () {
    var invites = [];

    before(testUtils.teardown);

    //@TODO: change to afterAll
    after(testUtils.teardown);

    beforeEach(function () {
        sandbox.stub(mail, 'send', function () {
            return Promise.resolve();
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('Invite Flow', function () {
        //@TODO: change to beforeAll
        before(testUtils.setup('owner:pre', 'owner:post', 'perms:invite', 'perms:init'));

        //@TODO: testUtils.DataGenerator.forKnex.invites
        it('add invite 1', function (done) {
            InvitesAPI.add({
                invites: [{email: 'kate+1@ghost.org', roles: [testUtils.roles.ids.editor]}]
            }, {context: {user: 1}})
                .then(function (response) {
                    response.invites.length.should.eql(1);
                    response.invites[0].roles.length.should.eql(1);
                    response.invites[0].roles[0].name.should.eql('Editor');

                    invites.push(response.invites[0]);
                    done();
                }).catch(done);
        });

        it('add invite 2', function (done) {
            InvitesAPI.add({
                invites: [{email: 'kate+2@ghost.org', roles: [testUtils.roles.ids.author]}]
            }, {context: {user: 1}})
                .then(function (response) {
                    response.invites.length.should.eql(1);
                    response.invites[0].roles.length.should.eql(1);
                    response.invites[0].roles[0].name.should.eql('Author');

                    invites.push(response.invites[0]);
                    done();
                }).catch(done);
        });

        it('add invite: empty invites object', function (done) {
            InvitesAPI.add({invites: []}, {
                context: {
                    user: 1
                }
            }).then(function () {
                throw new Error('expected validation error')
            }).catch(function (err) {
                should.exist(err);
                done();
            });
        });

        it('add invite: no email provided', function (done) {
            InvitesAPI.add({invites: [{status: 'sent'}]}, {
                context: {
                    user: 1
                }
            }).then(function () {
                throw new Error('expected validation error')
            }).catch(function (err) {
                (err instanceof errors.ValidationError).should.eql(true);
                done();
            });
        });

        it('browse invites', function (done) {
            InvitesAPI.browse(testUtils.context.owner)
                .then(function (response) {
                    response.invites.length.should.eql(2);

                    response.invites[0].status.should.eql('sent');
                    response.invites[0].email.should.eql('kate+1@ghost.org');
                    response.invites[0].roles.length.should.eql(1);
                    response.invites[0].roles[0].name.should.eql('Editor');

                    response.invites[1].status.should.eql('sent');
                    response.invites[1].email.should.eql('kate+2@ghost.org');
                    response.invites[1].roles.length.should.eql(1);
                    response.invites[1].roles[0].name.should.eql('Author');

                    should.not.exist(response.invites[0].token);
                    should.exist(response.invites[0].expires);

                    should.not.exist(response.invites[1].token);
                    should.exist(response.invites[1].expires);

                    done();
                }).catch(done);
        });

        it('read invites: not found', function (done) {
            InvitesAPI.read(_.merge({}, testUtils.context.owner, {email: 'not-existend@hey.org'}))
                .then(function () {
                    throw new Error('expected not found error for invite');
                })
                .catch(function (err) {
                    (err instanceof errors.NotFoundError).should.eql(true);
                    done();
                });
        });

        it('read invites', function (done) {
            InvitesAPI.read(_.merge({}, testUtils.context.owner, {email: 'kate+1@ghost.org'}))
                .then(function (response) {
                    response.invites.length.should.eql(1);
                    response.invites[0].roles.length.should.eql(1);
                    response.invites[0].roles[0].name.should.eql('Editor');
                    done();
                }).catch(done);
        });

        it('read invites', function (done) {
            InvitesAPI.read(_.merge({}, testUtils.context.owner, {email: 'kate+2@ghost.org'}))
                .then(function (response) {
                    response.invites.length.should.eql(1);
                    response.invites[0].roles.length.should.eql(1);
                    response.invites[0].roles[0].name.should.eql('Author');
                    done();
                }).catch(done);
        });

        it('destroy invite', function (done) {
            InvitesAPI.destroy({context: {user: 1}, id: invites[0].id})
                .then(function () {
                    return InvitesAPI.read(_.merge({}, testUtils.context.owner, {email: 'kate+1@ghost.org'}))
                        .catch(function (err) {
                            (err instanceof errors.NotFoundError).should.eql(true);
                            done();
                        });
                }).catch(done);
        });

        it('destroy invite: id does not exist', function (done) {
            InvitesAPI.destroy({context: {user: 1}, id: 100})
                .then(function () {
                    throw new Error('expect error on destroy invite');
                })
                .catch(function (err) {
                    (err instanceof errors.NotFoundError).should.eql(true);
                    done();
                });
        });

        it('browse invites', function (done) {
            InvitesAPI.browse(testUtils.context.owner)
                .then(function (response) {
                    response.invites.length.should.eql(1);
                    response.invites[0].email.should.eql('kate+2@ghost.org');
                    done();
                }).catch(done);
        });
    });
});
