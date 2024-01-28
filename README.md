<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Dalikey/programmeren-4-shareameal">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">programmeren-4-shareameal</h3>

  <p align="center">
    This is the project I had made for school. It's about making an API with nodeJS connected with a database.
    The API is made about sharing a meal. It's called programmeren-4-shareameal. There are also tests for this API.
    Tests as in you cannot randomly put stuff and send random data.

    The endpoints can be found in the documentation: https://shareameal-api.herokuapp.com/docs/#/

    There is more information about this project below, such as installation, if you were interested.

<div>
    <br />
    <a href="https://shareameal-api.herokuapp.com/docs/#/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/Dalikey/programmeren-4-shareameal/issues">Report Bug</a>
    ·
    <a href="https://github.com/Dalikey/programmeren-4-shareameal/issues">Request Feature</a>
</div>

  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

 <p align="center">
    Link to the Heroku application: https://programmeren-4-shareameal.herokuapp.com/  </p>

[![Product][product-screenshot]](https://example.com)

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

- [node.js](https://nodejs.org/en/)
- [mocha](https://www.npmjs.com/package/mocha)
- [chai](https://www.npmjs.com/package/chai)
- [joi](https://www.npmjs.com/package/joi)
- [express](https://www.npmjs.com/package/express)
- [mysql2](https://www.npmjs.com/package/mysql2)
- [logger](https://www.npmjs.com/package/logger)
- [assert](https://nodejs.org/api/assert.html)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [bcrypt](https://www.npmjs.com/package/bcrypt)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get a free API Key at [Heroku](https://dashboard.heroku.com/account)
2. Clone the repo
   ```sh
   git clone https://github.com/Dalikey/programmeren-4-shareameal.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in your `https://github.com/yourName/programmeren-4-shareameal/settings/environments` > New environments (Name it Heroku) > Add secret (HEROKU_API_KEY and as value your Heroku API)
   ```js
   heroku_api_key = 'ENTER YOUR API';
   ```
5. Change the heroku_email: in `main.yml` > to your own email that you logged into Heroku)
   ```js
   heroku_email = 'ENTER YOUR EMAIL';
   ```
6. You also need to setup the database, follow these steps in:
   https://brightspace.avans.nl/d2l/le/lessons/28302/topics/470175

### Push to Heroku

1. Open CMD
2. Change directory to project for example:
   ```sh
   cd C:\dev\programmeren-4\programmeren-4-shareameal
   ```
3. If you are on main branch you do:
   ```sh
   git push origin main
   ```

### In case you aren't on main branch

(You can stay on the branch you are on, but it is required if you want to push to Heroku)

1. Open CMD
2. Change directory to project for example:
   ```sh
   cd C:\dev\programmeren-4\programmeren-4-shareameal
   ```
3. If you are on not on main branch, you do:
   ```sh
   git checkout -b main
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

All you need to do if it's published in Heroku open your app, for example: https://programmeren-4-shareameal.herokuapp.com/ and add api/user to the end of the base.
Like this: https://programmeren-4-shareameal.herokuapp.com/api/user

If the format is not to your liking add this chrome extension: https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa

_For more examples, please refer to the [Documentation](https://shareameal-api.herokuapp.com/docs/#/)_

_Additional Info: Not in the documentation, add one of these this to the URL to filter by isActive or firstName:_

- /api/user?isActive=true
- /api/user?firstName=herman

An alternative is Postman, you can download it at: https://www.postman.com/downloads/
or you can use their website version.

You also need to download Xampp to startup your local server: https://www.apachefriends.org/index.html
Activate Apache and MySQL while using Postman.

If you use localhost:3000,

1. First you have to open CMD and change the directory:

   ```sh
   cd C:\dev\programmeren-4\programmeren-4-shareameal
   ```

2. Open Xampp and turn on Apache and MySQL Module

3. To start or test the server do:

   ```sh
   npm start
   or
   npm test
   ```

4. Enter npm start in CMD, you should see something like this:

   ```sh
   λ npm start

   > nodejs-server@0.0.1 start
   > nodemon index.js
   [nodemon] 2.0.15
   [nodemon] to restart at any time, enter `rs`
   [nodemon] watching path(s): *.*
   [nodemon] watching extensions: js,mjs,json
   [nodemon] starting `node index.js`
   2022-05-21T16:37:14Z [DEBUG] dbconnection.js:18 :
   2022-05-21T16:37:14Z [DEBUG] dbconnection.js:18 : {
   connectionLimit: 10,
   waitForConnections: true,
   queueLimit: 0,
   multipleStatements: true,
   host: 'localhost',
   port: '3306',
   user: 'root',
   password: '',
   database: 'share-a-meal'
   }
   2022-05-21T16:37:14Z [DEBUG] index.js:40 : Programmeren-4-shareameal app listening on port 3000
   ```

   Your server should now start.

For npm test you still need to implement the data in the database. To do that you do:

1. Ctrl+C twice to stop the server and enter the following commands step by step:
   ```sh
   mysql -u root
   show databases;
   source share-a-meal.create.sql
   source share-a-meal.sql
   use share-a-meal-testdb
   source share-a-meal.sql
   show tables;
   SELECT * FROM user;
   SELECT * FROM meal;
   ```
   The database with data should exist and now you can run the test.

In Postman, just create a new workspace,
Because I added authentication you first need to login with an existing account to use these features.
To do that you need to:

1. Open CMD
2. Change directory to project for example and npm start like described above:

   ```sh
   cd C:\dev\programmeren-4\programmeren-4-shareameal
   ```

   [![Postman][postman-screenshot]](https://example.com)

3. Like the picture above, select the values and enter these values as replacement:

   ```sh
   localhost:3000/api/auth/login
   ```

   ```json
   {
     "emailAdress": "h.tank@server.com",
     "password": "secret"
   }
   ```

4. Select POST and click the send button, you should see:

   ```json
   {
     "status": 200,
     "result": {
       "id": 5,
       "emailAdress": "h.tank@server.com",
       "firstName": "Henk",
       "lastName": "Tank",
       "street": "",
       "city": "",
       "isActive": true,
       "phoneNumber": "06 12425495",
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTY1MzE1MzA3NCwiZXhwIjoxNjU0MTg5ODc0fQ.7WinUC47Yggg-s505gVujr-YeUz6bwY5d9Hbqp4WXNY"
     }
   }
   ```

   There is a time limit on the token, so it may be invalid. In that case, you will need to log in again or if you have forgotten the password, create a new account and repeat the login steps.

5. Add the token to Postman to login:
   Left side Postman, create new collection > authorization > select as type, Bearer Token > paste the token.
   You now should be able to use more features. For showing meals you don't need to login: https://programmeren-4-shareameal.herokuapp.com/api/meal

6. If you select GET instead of POST and replace link with localhost:3000/api/user, you should be able to see the result.
   If the request is invalid, you will get a message with info.

Example data for adding an user:

```json
{
  "firstName": "Isaac",
  "lastName": "Brock",
  "street": "Lovensdijkstraat 61",
  "city": "Breda",
  "isActive": true,
  "emailAdress": "isaaac.brock@example.com",
  "password": "123",
  "phoneNumber": "0649118471"
}
```

Source: https://brightspace.avans.nl/d2l/le/lessons/28302/units/473919

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/Dalikey/programmeren-4-shareameal/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Junhao Chen - discord: NoName#5320 - mjh.chen@student.avans.nl

Project Link: [https://github.com/Dalikey/programmeren-4-shareameal](https://github.com/Dalikey/programmeren-4-shareameal)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/Dalikey/programmeren-4-shareameal.svg?style=for-the-badge
[contributors-url]: https://github.com/Dalikey/programmeren-4-shareameal/graphs/contributors
[stars-shield]: https://img.shields.io/github/stars/Dalikey/programmeren-4-shareameal.svg?style=for-the-badge
[stars-url]: https://github.com/Dalikey/programmeren-4-shareameal/stargazers
[issues-shield]: https://img.shields.io/github/issues/Dalikey/programmeren-4-shareameal.svg?style=for-the-badge
[issues-url]: https://github.com/Dalikey/programmeren-4-shareameal/issues
[license-shield]: https://img.shields.io/github/license/Dalikey/programmeren-4-shareameal.svg?style=for-the-badge
[license-url]: https://github.com/Dalikey/programmeren-4-shareameal/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png
[postman-screenshot]: images/postman.png
