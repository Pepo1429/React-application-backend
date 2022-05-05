/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */

const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const User = require('../models/user');

const router = Router({
  prefix: '/api/v1.0/users',
}); // Prefixed all routes with /api/v1.0/articles
// because we are going to parse POST parameters we will import koa-bodyparser

// the id should be a number greater than or equal 1
router.get('/:email', bodyParser(), async (ctx) => {
  const email = ctx.params.email;
  const user = await new User();
  const data = await user.retrieve(email);
  console.log(email);
  if (data.length === 0) {
    ctx.response.status = 404;
    ctx.body = { message: 'user not found' };
  } else { ctx.body = data; }
});

// note that we have injected the body parser onlyin the POST request
router.post('/', bodyParser(), async (ctx) => {
  ctx.session.userID = ctx.request.body.values.email;

  // prevent server crash if values is undefined
  const newUser = {
    email: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.email,
    password: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.password,
    passwordConfirmation: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.passwordConfirmation,
    firstName: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.firstName,
    lastName: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.lastName,
    country: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.country,
    calendar: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.calendar,
    username: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.username,
  };
  try {
    const user = await new User();

    await user.register(newUser);

    ctx.response.status = 200;
    ctx.body = { message: 'user was added successfully' };
  } catch (error) {
    ctx.response.status = error.status;
    ctx.body = { message: error.message };
  }
});
router.put('/:email', bodyParser(), async (ctx) => {
  const email = ctx.params.email;
  const editUser = {
    firstName: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.firstName,
    lastName: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.lastName,
    countryId: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.countryId,
    BirthDate: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.BirthDate,
    username: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.username,
    about: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.about,
  };
  try {
    const user = await new User();
    const checked = await user.checkData(editUser);
    if (checked.length !== 0) {
      await user.update(checked, email);
    }
    ctx.response.status = 201;
    ctx.body = { message: 'user was updated successfully' };
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = { message: error.message };
  }
});
router.del('/:email', bodyParser(), async (ctx) => {
  const email = ctx.params.email;
  try {
    const user = await new User();
    await user.deleteUser(email);
    ctx.response.status = 201;
    ctx.body = { message: 'user was deleted successfully' };
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = { message: error.message };
  }
});

module.exports = router;
