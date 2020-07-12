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

      .columns {
        margin: 0;
        padding: 0;
        cursor: text;
      }

      .column {
        margin: 0;
        padding: 0;
      }

      .editor .CodeMirror {
        background-color: rgba(0, 0, 0, 0) !important;
        height: 100vh;
        font-family: Monaco, monospace;
        font-size: 14px;
      }
      .editor .CodeMirror .CodeMirror-line > span {
        border-radius: 4px;
        padding: 1px;
        background-color: rgba(0, 0, 0, 0.6);
      }
      .editor .CodeMirror .CodeMirror-line .flash-selection {
        background-color: #ffff77cc;
        color: #000;
      }
      .editor.is-half-height .CodeMirror {
        height: 50vh;
      }

      .remote-caret {
        position: absolute;
        border-left: black;
        border-left-style: solid;
        border-left-width: 2px;
        height: 1.1em;
      }

      .remote-caret > div {
        position: relative;
        top: 1.5em;
        left: -2px;
        font-size: 14px;
        background-color: #fa8100;
        font-family: Monaco, monospace;
        font-style: normal;
        font-weight: normal;
        line-height: normal;
        user-select: none;
        color: white;
        padding-left: 2px;
        padding-right: 2px;
        z-index: 3;
      }

      .status {
        position: absolute;
        bottom: 0;
        right: 0;
        background: transparent;
        text-align: right;
        color: #fefefe;
        z-index: 1000;
        font-family: monospace;
        font-weight: bold;
      }

      .users-list {
        position: absolute;
        top: 0;
        right: 0;
        background: transparent;
        font-size: 0.9em;
        text-align: right;
        color: #fefefe;
        z-index: 1000;
        font-family: monospace;
        font-style: italic;
      }
      .users-list ul {
        list-style-type: none;
        margin: 0;
      }

      .evaluate {
        display: none;
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
