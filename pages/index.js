import dynamic from "next/dynamic";
import React from "react";

const TextEditor = dynamic(() => import("../components/TextEditor"), {
  ssr: false
});

const Home = () => (
  <div>
    <TextEditor
      options={{
        mode: "haskell",
        theme: "material",
        lineNumbers: true
      }}
    />
  </div>
);

export default Home;
