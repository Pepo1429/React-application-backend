/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const User = require('../models/user');
const Password = require('../models/password');


const router = Router({
  prefix: '/api/v1.0/edit',
}); // Prefixed all routes with /api/v1.0/articles
// because we are going to parse POST parameters we will import koa-bodyparser

router.get('/:email', bodyParser(), async (ctx) => {
  const email = ctx.params.email;
  if (email === null) {
    ctx.response.status = 494;
    ctx.body = 'You do not have permission';
    console.log('ok');
  }
  const user = await new User();
  const data = await user.dataForEdit(email);
  console.log(email);
  if (data.length === 0) {
    ctx.response.status = 404;
    ctx.body = { message: 'user not found' };
  } else { ctx.body = data; }
});

router.put('/passwordChange/:email', bodyParser(), async (ctx) => {
  const email = ctx.params.email;
  if (email === null) {
    ctx.response.status = 404;
    ctx.body = 'You do not have permission';
    console.log('ok');
  }
  const passwordEdit = {
    OldPassword: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.OldPassword,
    NewPassword: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.NewPassword,
    ConfirmPassword: ctx.request.body.values === undefined ? undefined : ctx.request.body.values.ConfirmPassword,
  };

  try {
    const password = await new Password();
    const user = await new User();
    await password.insertPassword(passwordEdit, email);
    await user.updatePassword(passwordEdit, email);

    ctx.response.status = 200;
    ctx.body = { message: 'Password Changed' };
  } catch (error) {
    ctx.response.status = 400;
    ctx.body = { message: 'Your current password is incorrect' };
  }
});


module.exports = router;
