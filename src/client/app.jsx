import React, { Fragment as F, Component } from "react";
import { Helmet } from "react-helmet";
import { Route, Switch, withRouter } from "react-router-dom";
import autobind from "autobind-decorator";
import PropTypes from "prop-types";

import HomePage from "./pages/home";

@withRouter
class App extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired
  }

  render() {
    return (
      <F>
        <Helmet>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=no"
          />
          <meta name="theme-color" content="#FA6607" />

          <link rel="icon" href="/favicon.ico?v=4" />
        </Helmet>

        <Switch>
          <Route exact path="/" component={HomePage} />
        </Switch>
      </F>
    );
  }
}

export default App;
