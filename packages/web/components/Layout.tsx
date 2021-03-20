import Head from "next/head";
import React from "react";

const Layout = (
  { children, backgroundOpacity }: { children: any, backgroundOpacity?: number }
) => <div>
  <Head>
    <title>flok</title>
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500&display=swap"
      rel="stylesheet"
    ></link>
  </Head>
  {children}
  <style global jsx>
    {`
      html {
        background-color: rgba(0, 0, 0, ${(typeof backgroundOpacity == 'number') ? backgroundOpacity : 0.93});
        color: #efefef;
        overflow: hidden;
        font-family: "Roboto Mono", monospace;
        font-size: 18px;
        line-height: 24px;
      }

      body {
        overflow: hidden;
      }

      pre {
        font-family: "Roboto Mono", monospace;
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

      @media only screen and (max-width: 800px) {
        html {
          overflow: auto;
        }

        body {
          overflow: auto;
        }
      }
    `}
  </style>
</div>;

export default Layout;
