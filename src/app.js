require("any-promise/register/bluebird");

import _ from "lodash";
import http from "http";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dfns from "date-fns";

import TimeEdit from "./timeedit";

import indexRouter from "./routes/index";
import apiRouter from "./routes/api";
import usersRouter from "./routes/users";

// Express
export const app = express();

// Express middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/v1", apiRouter);

app.get("*", function(req, res, next) {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});



// Booking test
// import { Builder, By, Key, until } from "selenium-webdriver";
// import rp from "request-promise";
// import req from "request";
// import tough from "tough-cookie";

// (async function example() {
//   let driver = await new Builder().forBrowser('chrome').build();
//   try {
//     await driver.get("https://se.timeedit.net/web/chalmers/db1/timeedit/sso/saml2?back=https%3A%2F%2Fcloud.timeedit.net%2Fchalmers%2Fweb%2Fb1%2Fri1Q5008.html");

//     await driver
//       .findElement(By.id("ctl00_ContentPlaceHolder1_UsernameTextBox"))
//       .sendKeys("cid");

//     const pwBox = await driver.findElement(By.id("ctl00_ContentPlaceHolder1_PasswordTextBox"));

//     await pwBox.sendKeys("pw");
//     await pwBox.sendKeys(Key.ENTER);

//     const cookies = await driver.manage().getCookies();

//     const token = _.find(cookies, c => c.name == "TEchalmersweb");
//     const ssoParams = _.find(cookies, c => c.name == "sso-parameters");

//     if (!token || !ssoParams) return;

//     console.log(token, ssoParams);

//     const c = "TimeEditLanguage=sv; sso-parameters=" + ssoParams.value +
//           "; TEchalmersweb=" + token.value;

//     const body = "kind=reserve&nocache=4&l=sv_SE&o=192422&aos=&dates=20181201&starttime=8%3A00&endtime=9%3A00&url=https%3A%2F%2Fcloud.timeedit.net%2Fchalmers%2Fweb%2Fb1%2Fri1Q5008.html%2300192493&fe2=Labb&fe8=";

//     const jar = req.jar();
//     jar.setCookie(new tough.Cookie({
//       key: "sso-parameters",
//       value: ssoParams.value,
//       domain: ssoParams.domain,
//       httpOnly: ssoParams.httpOnly
//     }).toString(), "https://cloud.timeedit.net");
//     jar.setCookie(new tough.Cookie({
//       key: "TEchalmersweb",
//       value: token.value,
//       domain: token.domain,
//       httpOnly: token.httpOnly
//     }).toString(), "https://cloud.timeedit.net");

//     console.log(jar);
//     rp({
//       method: "POST",
//       uri: "https://cloud.timeedit.net/chalmers/web/b1/ri1Q5008.html",
//       headers: {
//         "content-type": "application/x-www-form-urlencoded",
//         "content-length": body.length,
//         "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36",
//         "content-type": "application/x-www-form-urlencoded",
//         "cache-control": "no-cache",
//         "accept": "text/html, */*; q=0.01",
//         "accept-encoding": "gzip, deflate, br",
//         "accept-language": "sv-SE,sv;q=0.8,en-US;q=0.6,en;q=0.4",
//         "origin": "https://cloud.timeedit.net",
//         "referer": "https://cloud.timeedit.net/chalmers/web/b1/ri1Q5008.html"
//       },
//       jar: jar,
//       body
//     }).then(res => {
//       console.log(res);
//     });

//   } finally {
//     await driver.quit();
//   }
// })();
