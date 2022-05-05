/* eslint-disable prefer-destructuring */

const Router = require('koa-router');
const ImageDataURI = require('image-data-uri');

const router = Router({
  prefix: '/api/v1.0/upload',
}); // Prefixed all routes with /api/v1.0/articles
// because we are going to parse POST parameters we will import koa-bodyparser
const bodyParser = require('koa-bodyparser');
const model = require('../models/upload');


router.post('/:email', bodyParser(), async (ctx) => {
  const email = ctx.params.email;
  const name = Math.random().toString(10).substr(2, 9);
  const dataJSON = ctx.request.body;
  const url = 'http://localhost:3000/';
  const jsonStr = Object.values(dataJSON);
  const StrImg = jsonStr.toString();
  // console.log(StrImg);
  ImageDataURI.outputFile(StrImg, `public/${name}.png`);
  const allInf = `${url + name}.png`;
  console.log(allInf);
  try {
    if (dataJSON === null) {
      const empty = '';
      await model.add(empty, email);
    }
    await model.add(allInf, email);
    ctx.response.status = 201;
    ctx.body = { message: 'uploading sucess' };
  } catch (error) {
    ctx.response.status = 500;
    ctx.body = { message: error.message };
  }
});

module.exports = router;
