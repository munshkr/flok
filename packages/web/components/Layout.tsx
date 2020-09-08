import Head from "next/head";
import React from "react";

export default ({ children }: { children: any }) => (
  <div>
    <Head>
      <title>flok</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      {/* <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.0/css/bulma.min.css" /> */}
    </Head>
    {children}
    <style global jsx>{`
      html {
        background-color: #101010;
        overflow: hidden;
      }

      body {
        overflow: hidden;
      }

      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(90, 90, 90, 0.4);
      }
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
      }

      @media only screen and (max-width: 600px) {
        html {
          overflow: scroll;
        }
      }
    `}
    </style>
  </div>
);
