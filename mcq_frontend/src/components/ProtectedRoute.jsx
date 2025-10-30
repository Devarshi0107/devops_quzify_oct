

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  console.log("i am frm rotected route ");
  const isLoggedIn = window.localStorage.getItem("loggedIn");
  return isLoggedIn==="true"?<Outlet/>:<Navigate to="login"/>;
}

export default ProtectedRoute;