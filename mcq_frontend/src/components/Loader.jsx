import React from "react";
import { ClipLoader } from "react-spinners";
import { useLoader } from "../context/LoaderContext";

const Loader = () => {
  const { loading } = useLoader();

  if (!loading) return null; 

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <ClipLoader color="white" size={60} />
    </div>
  );
};

export default Loader;
