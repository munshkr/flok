import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";
import Layout from "../../components/Layout";

const TextEditor = dynamic(() => import("../../components/TextEditor"), {
  ssr: false
});

const SessionPage = ({ name }) => (
  <Layout>
    <Head>
      <title>{`flok ~ ${name}`}</title>
    </Head>
    <TextEditor sessionName={name} />
  </Layout>
);

SessionPage.getInitialProps = async ({ query }) => {
  return { name: query.name };
};

export default SessionPage;
