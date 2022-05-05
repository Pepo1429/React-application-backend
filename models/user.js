/* eslint-disable no-throw-literal */
const mysql = require('promise-mysql');
const bcrypt = require('bcryptjs');
const info = require('../config');

module.exports = class User {
  constructor() {
    return (async () => {
      const connection = await mysql.createConnection(info.config);
      const sql = `CREATE TABLE IF NOT EXISTS user (
                ID INT NOT NULL AUTO_INCREMENT,
                Username TEXT(32),
                Password TEXT(256),
                passwordSalt VARCHAR(32),
                firstName TEXT(32),
                LastName TEXT(32),
                profileImageURL TEXT(256),
                Email VARCHAR(32) UNIQUE,
                About TEXT(1024),
                CountryId TEXT(25),
                BirthDate TEXT,
                dateRegistered DATE,
                Active BOOLEAN,
                Deleted BOOLEAN,
                PRIMARY KEY (id)
                )`;
      await connection.query(sql);
      return this;
    })();
  }

  async register(user) {
    try {
      //  console.log(user)
      // server validation rules
      // email is required
      if (user.email === undefined) {
        throw { message: 'email is required', status: 400 };
      }
      // paswword is required
      if (user.password === undefined) {
        throw { message: 'password is required', status: 400 };
      } else {
        // if password is provided it must be ay least 6 characters long
        // eslint-disable-next-line no-lonely-if
        if (user.password.length < 6) {
          throw { message: 'password must be more than 6 characters long', status: 400 };
        }
      }
      // passwordConfrimation is required
      if (user.passwordConfirmation === undefined) {
        throw { message: 'password confirmation is required', status: 400 };
      } else {
        // if passwordConfirmation is provided then it must match password
        // eslint-disable-next-line no-lonely-if
        if (user.password !== user.passwordConfirmation) {
          throw { message: 'passwords don\'t match', status: 400 };
        }
      }
      // email should be a valid email address
      // we will use a regular expression to validate the email format
      // eslint-disable-next-line no-useless-escape
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zAZ]{2,}))$/;
      if (!re.test(String(user.email).toLowerCase())) { throw { message: 'invalid email address format', status: 400 }; }

      // final check is to make sure that email should be unique and never been used in the system
      // note that we needed to escape the ' character in roder to make the sql statement works
      // eslint-disable-next-line no-useless-escape
      let sql = `SELECT email from user WHERE email = \'${user.email}\'`;

      const connection = await mysql.createConnection(info.config);
      let data = await connection.query(sql);

      // if the query return a record then this email has been used before
      if (data.length) {
        // first close the connection as we are leaving this function
        await connection.end();
        // then throw an error to leave the function
        throw { message: 'email address already in use', status: 400 };
      }

      // hash the password using bcryptjs package
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(user.password, salt);
      const date = await this.getdate();
      // create a new object to hold users final data
      const userData = {

        Email: user.email,
        Password: user.password,
        passwordSalt: hash,
        firstName: user.firstName,
        LastName: user.lastName,
        CountryId: user.country,
        BirthDate: user.calendar,
        dateRegistered: date,
        Username: user.username,
        Active: true,
        Deleted: false,
        // created: new Date()
      };

      // this is the sql statement to execute
      sql = 'INSERT INTO user SET ?';

      data = await connection.query(sql, userData);
      console.log(userData);

      await connection.end();

      return data;
    } catch (error) {
      // in case we caught an error that has no status defined then this isan error from our DB
      // therefore we should set the status code to server error
      // eslint-disable-next-line no-undef
      if (error.status === undefined) { ctx.status = 500; }
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async retrieve(email) {
    try {
      // first connect to the database
      const connection = await mysql.createConnection(info.config);
      // this is the sql statement to execute
      // eslint-disable-next-line no-useless-escape
      let sql = `SELECT Username,firstName,LastName,profileImageURL,Email,About,CountryId,BirthDate,dateRegistered,Active from user WHERE email = \'${email}\'`;

      // wait for the async code to finish
      const data = await connection.query(sql);
      console.log(data);


      // eslint-disable-next-line no-useless-escape
      sql = `SELECT oldPassword, dateChanged from passwordchange WHERE userEmail = \'${email}\'`;

      // wait for the async code to finish
      const passHistory = await connection.query(sql);
      // wait until connection to db is closed
      await connection.end();

      const userData = {
        data, passHistory,
      };
      console.log(userData);

      // return the result
      return userData;
    } catch (error) {
      // if an error occured please log it and throw an exception
      throw new Error(error);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async update(userEdit, email) {
    try {
      console.log(userEdit);
      const connection = await mysql.createConnection(info.config);
      // create a new object to hold users final data


      // this is the sql statement to execute
      // eslint-disable-next-line no-useless-escape
      const sql = `UPDATE user SET ? WHERE email = \'${email}\'`;
      const data = await connection.query(sql, userEdit);
      console.log(email);

      await connection.end();

      return data;
    } catch (error) {
      // in case we caught an error that has no status defined then this isan error from our DB
      // therefore we should set the status code to server error
      // eslint-disable-next-line no-undef
      if (error.status === undefined) { ctx.status = 500; }
      throw error;
    }
  }


  // eslint-disable-next-line class-methods-use-this
  async deleteUser(email) {
    try {
      const connection = await mysql.createConnection(info.config);
      // this is the sql statement to execute
      // eslint-disable-next-line no-useless-escape
      const sql = `DELETE FROM user WHERE email = \'${email}\'`;
      const data = await connection.query(sql);
      await connection.end();
      return data;
    } catch (error) {
      // in case we caught an error that has no status defined then this isan error from our DB
      // therefore we should set the status code to server error
      // eslint-disable-next-line no-undef
      if (error.status === undefined) { ctx.status = 500; }
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getdate() {
    const date = new Date(Date.now());
    const slice = 10;
    const strDate = date.toISOString().slice(0, slice);
    return strDate;
  }

  // eslint-disable-next-line class-methods-use-this
  async dataForEdit(email) {
    try {
      // first connect to the database
      const connection = await mysql.createConnection(info.config);
      // this is the sql statement to execute
      // eslint-disable-next-line no-useless-escape
      const sql = `SELECT Username,firstName,LastName,profileImageURL,Email,About,CountryId,BirthDate, dateRegistered from user WHERE email = \'${email}\'`;

      // wait for the async code to finish
      const data = await connection.query(sql);

      // wait until connection to db is closed
      await connection.end();

      // return the result
      return data;
    } catch (error) {
      // if an error occured please log it and throw an exception
      throw new Error(error);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async updatePassword(userEdit, email) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(userEdit.NewPassword, salt);
    try {
      const connection = await mysql.createConnection(info.config);

      // create a new object to hold users final data
      const editPassword = {
        Password: userEdit.NewPassword,
        passwordSalt: hash,
      };
      // this is the sql statement to execute
      // eslint-disable-next-line no-useless-escape
      const sql = `UPDATE user SET ? WHERE email = \'${email}\'`;
      const data = await connection.query(sql, editPassword);
      console.log(editPassword);
      console.log(email);

      await connection.end();

      return data;
    } catch (error) {
      // in case we caught an error that has no status defined then this isan error from our DB
      // therefore we should set the status code to server error
      // eslint-disable-next-line no-undef
      if (error.status === undefined) { ctx.status = 500; }
      throw error;
    }
  }


  // eslint-disable-next-line class-methods-use-this
  async checkData(userData) {
    const ent = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(userData)) {
      if (value !== undefined) {
        ent[key] = value;
      }
    }
    console.log(ent);
    return ent;
  }
};
