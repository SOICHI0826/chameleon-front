"use client"
import { createContext, useContext, useReducer } from "react";

const initialState = {
  userId: null,
  idToken: null,
  accessToken: null,
  refreshToken: null,
};

const authContext = createContext();

function reducer(state, action) {
  switch(action.type) {
    // ログイン
    case "auth/login":
      return {
        ...state,
        userId: action.payload.userId,
        idToken: action.payload.idToken,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken
      };
    // ログアウト
    case "auth/logout":
      return initialState;
  }
}

function AuthProvider({ children }) {
  const [{
    userId, 
    idToken,
    accessToken,
    refreshToken}, dispatch] = useReducer(reducer, initialState);

  // ログイン
  function authLogin(authInfo) {
    dispatch({ type: "auth/login", payload: {
       "userId": authInfo.userId,
       "idToken": authInfo.idToken,
       "accessToken": authInfo.accessToken,
       "refreshToken": authInfo.refreshToken
      } });
  }
  
  // ログアウト
  function authLogout() {
    dispatch({ type: "auth/logout", payload: null });
  }
  
  return (
    <authContext.Provider
      value={{
        userId,
        idToken,
        accessToken,
        refreshToken,
        authLogin,
        authLogout
      }}
    >
      {children}
    </authContext.Provider>
  );
}

function useAuth() {
  const context = useContext(authContext);
  if (context === undefined)
    throw new Error("authContext");
  return context;
}

export { AuthProvider, useAuth };