import dynamic from "next/dynamic";
import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import Layout from "../../components/Layout";

const TextEditor = dynamic(() => import("../../components/TextEditor"), {
  ssr: false
});

const SessionPage = ({ host, session, user }) => (
  <Layout>
    <Head>
      <title>{`${session} :: flok`}</title>
    </Head>
    <TextEditor websocketsHost={host} sessionName={session} userName={user} />
  </Layout>
);

SessionPage.getInitialProps = async ({ req, query }) => {
  const host = req && req.headers && req.headers.host;
  return { host, session: query.session, user: query.user };
};

SessionPage.propTypes = {
  host: PropTypes.string.isRequired,
  session: PropTypes.string.isRequired,
  user: PropTypes.string
};

SessionPage.defaultProps = {
  user: "anonymous"
};

export default SessionPage;
