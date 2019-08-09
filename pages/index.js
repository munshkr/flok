import React from "react";
import Head from "next/head";
import FlockScene from "../components/FlockScene";

const IndexPage = () => (
  <div>
    <Head>
      <title>flok</title>
    </Head>
    <h1>flok</h1>
    <FlockScene />
    <style jsx>
      {`
        body {
          overflow: hidden;
        }

        h1 {
          color: #eee;
          width: 100%;
          text-align: center;
        }
      `}
    </style>
  </div>
);

export default IndexPage;
