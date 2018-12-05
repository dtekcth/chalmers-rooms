require("@fortawesome/fontawesome/styles.css");

import React, { Component } from "react";
import fontawesome from "@fortawesome/fontawesome";
import regular from "@fortawesome/fontawesome-free-regular";
import solid from "@fortawesome/fontawesome-free-solid";
import brands from "@fortawesome/fontawesome-free-brands";
import { mount } from "react-mounter";

fontawesome.library.add(
  regular,
  solid,
  brands
);

import {
  BrowserRouter as Router
} from "react-router-dom";

import App from "./app";

const Root = () => ( 
  <Router>
    <App />
  </Router>
);


mount(Root, document.getElementById("react-root"));
