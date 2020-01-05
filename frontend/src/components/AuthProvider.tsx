import React, { useState, useContext, useEffect } from "react";
import FullScreenSpinner from "./FullScreenSpinner";
import { gql, ApolloError } from "apollo-boost";
import { useApolloClient } from "@apollo/react-hooks";

type User = {
  id: string;
  email: string;
  name: string;
  permissions: string[];
};

export type Credentials = {
  email: string;
  password: string;
};

export enum AuthStatus {
  FetchingFromStorage,
  NotLoggedIn,
  LoggingIn,
  LoggingFailed,
  LoggedIn
}

interface State {
  user?: User;
  status: AuthStatus;
}

interface Auth extends State {
  login: (credentials: Credentials) => void;
  logout: () => void;
  can: (permission: string) => boolean;
}

const AuthContext = React.createContext<Auth>({
  status: AuthStatus.NotLoggedIn,
  login: _ => {},
  logout: () => {},
  can: _ => false
});

const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    name
    email
    permissions
  }
`;

const LOGIN_MUTATION = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

const ME_QUERY = gql`
  query {
    me {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

function AuthProvider({ children }: any) {
  const client = useApolloClient();

  const [state, setState] = useState<State>({
    status: AuthStatus.FetchingFromStorage
  });

  /*
    When the app mounts this tries to fetch the user.
    If she was already logged in, the token should be sent (see the Apollo Client config),
    the backend should return the (possibly changed) user data which we store, and then set the LoggedIn status.
    Otherwise, if the token was not present or invalid (the backend returns and error), we set the NotLoggedIn status.
  */
  useEffect(() => {
    if (localStorage.getItem("token"))
      client
        .query({ query: ME_QUERY })
        .then(({ data }) =>
          setState({ user: data.me, status: AuthStatus.LoggedIn })
        )
        .catch(() => setState({ status: AuthStatus.NotLoggedIn }));
    else setState({ status: AuthStatus.NotLoggedIn });
  }, []);

  if (state.status == AuthStatus.FetchingFromStorage)
    return <FullScreenSpinner />;

  const login = (credentials: Credentials) => {
    setState({ status: AuthStatus.LoggingIn });

    client
      .mutate({ mutation: LOGIN_MUTATION, variables: credentials })
      .then(({ data }) => {
        const { token, user } = data.login;
        localStorage.setItem("token", token);
        setState({ user, status: AuthStatus.LoggedIn });

        // Clear the Apollo cache
        client.resetStore();
      })
      .catch((error: ApolloError) => {
        if (error.graphQLErrors[0].message == "invalid_credentials")
          setState({ status: AuthStatus.LoggingFailed });
        else {
          setState({ status: AuthStatus.NotLoggedIn });
          throw error;
        }
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setState({ status: AuthStatus.NotLoggedIn });
  };

  const can = (permission: string) =>
    state.user != null && state.user.permissions.includes(permission);

  const auth: Auth = {
    ...state,
    login,
    logout,
    can
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
