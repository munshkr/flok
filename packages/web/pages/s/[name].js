import dynamic from "next/dynamic";
import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import Layout from "../../components/Layout";

const TextEditor = dynamic(() => import("../../components/TextEditor"), {
  ssr: false
});

const SessionPage = ({ host, name }) => (
  <Layout>
    <Head>
      <title>{`flok ~ ${name}`}</title>
    </Head>
    <TextEditor websocketsHost={host} sessionName={name} />
  </Layout>
);

SessionPage.getInitialProps = async ({ req, query }) => {
  const host = req && req.headers && req.headers.host;
  return { host, name: query.name };
};

SessionPage.propTypes = {
  host: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

export default SessionPage;
