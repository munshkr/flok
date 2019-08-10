import Head from "next/head";
import React from "react";
import "../styles/styles.scss";

export default ({ children }) => (
  <div>
    <Head>
      <title>flok</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    {children}
  </div>
);
