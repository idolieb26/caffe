import React, { Fragment } from "react";
import { Route, Switch } from "react-router-dom";
import { SemanticToastContainer } from "react-semantic-toasts";
import "react-semantic-toasts/styles/react-semantic-alert.css";
import ConfigPage from "../configuration/ConfigPage";
import HomePage from "../HomePage";
import LoginPage from "../LoginPage";
import NotFoundPage from "./NotFoundPage";
import PrivateRoute from "./PrivateRoute";

function Routes() {
  return (
    <Fragment>
      <Switch>
        <PrivateRoute exact path="/">
          <HomePage />
        </PrivateRoute>
        <PrivateRoute path="/config" permission="list_users">
          <ConfigPage />
        </PrivateRoute>
        <Route path="/login">
          <LoginPage />
        </Route>
        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
      <SemanticToastContainer position="bottom-right" />
    </Fragment>
  );
}

export default Routes;
