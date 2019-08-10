import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";

const TextEditor = dynamic(() => import("../../components/TextEditor"), {
  ssr: false
});

const SessionPage = ({ name }) => (
  <div>
    <Head>
      <title>{`flok ~ ${name}`}</title>
    </Head>
    <TextEditor sessionName={name} />
  </div>
);

SessionPage.getInitialProps = async ({ query }) => {
  return { name: query.name };
};

export default SessionPage;
