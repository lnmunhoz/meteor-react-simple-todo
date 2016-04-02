/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

import { Tasks } from './tasks.js';

if (Meteor.isServer) {
  describe('Tasks', () => {

    describe('methods', () => {
      Meteor.users.remove({});
      const username = 'usertester';
      const password = 'topsecret';
      const userId = Accounts.createUser({ username, password })

      let taskId;

      beforeEach(() => {
        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });
      });

      it('can delete owned task', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];

        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };

        // Run the method with `this` set to the fake invocation
        deleteTask.apply(invocation, [taskId]);

        // Verify that the method does what we expected
        assert.equal(Tasks.find().count(), 0);
      });

      it('can make owned task private', () => {
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];
        const invocation = { userId };

        setPrivate.apply(invocation, [taskId, true])

        const task = Tasks.findOne({ _id: taskId });
        assert.equal(task.private, true);
      })
    });
  });
}
