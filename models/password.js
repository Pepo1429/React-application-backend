/* eslint-disable no-useless-escape */
/* eslint-disable class-methods-use-this */

const mysql = require('promise-mysql');
const info = require('../config');


module.exports = class Password {
  constructor() {
    return (async () => {
      const connection = await mysql.createConnection(info.config);
      const sql = `CREATE TABLE IF NOT EXISTS passwordchange (
                ID INT NOT NULL AUTO_INCREMENT,
                oldPassword TEXT(256),
                userEmail VARCHAR(32),
                dateChanged TEXT,
                PRIMARY KEY (id)
                )`;
      await connection.query(sql);
      return this;
    })();
  }

  async insertPassword(password, email) {
    try {
      let sql = `SELECT Password from user WHERE
            email = \'${email}\'`;
      let connection = await mysql.createConnection(info.config);
      const isPass = await connection.query(sql);
      const pass = isPass[0].Password;
      console.log(isPass[0].Password, password.OldPassword);
      await connection.end();
      if (pass !== password.OldPassword) {
        await connection.end();
        // eslint-disable-next-line no-throw-literal
        throw { message: 'Your current password is incorrect', status: 400 };
      }
      const DateChng = await this.getdate();
      const userPassword = {
        userEmail: email,
        oldPassword: password.OldPassword,
        dateChanged: DateChng,
      };
      connection = await mysql.createConnection(info.config);
      sql = 'INSERT INTO passwordchange SET ?';
      await connection.query(sql, userPassword);
      await connection.end();
    } catch (error) {
      // eslint-disable-next-line no-undef
      if (error.status === undefined) { ctx.status = 500; }
      throw error;
    }
  }

  async getdate() {
    const date = new Date(Date.now());
    const slice = 10;
    const strDate = date.toISOString().slice(0, slice);
    return strDate;
  }
};
