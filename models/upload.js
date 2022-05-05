
const mysql = require('promise-mysql');
const info = require('../config');


exports.add = async (user, email) => {
  const connection = await mysql.createConnection(info.config);
  console.log('ok');
  try {
    // create a new object to hold users final data
    const imageSave = {

      profileImageURL: user,
    // created: new Date()
    };
    console.log(imageSave);

    // this is the sql statement to execute
    // eslint-disable-next-line no-useless-escape
    const sql = `UPDATE user SET ? WHERE email = \'${email}\'`;

    const data = await connection.query(sql, imageSave);

    await connection.end();

    return data;
  } catch (error) {
    // in case we caught an error that has no status defined then this isan error from our database
    // therefore we should set the status code to server error
    if (error.status === undefined) { error.status = 500; }
    throw error;
  }
};
