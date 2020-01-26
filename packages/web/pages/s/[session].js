import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import getConfig from "next/config";

import Layout from "../../components/Layout";
import Session from "../../components/Session";

const { publicRuntimeConfig } = getConfig();
const { isDevelopment } = publicRuntimeConfig;

class SessionPage extends React.Component {
  static async getInitialProps({ req, query }) {
    const host = req && req.headers && req.headers.host;
    return { host, session: query.session, user: query.user };
  }

  componentDidMount() {
    if (isDevelopment) {
      console.log("*** DEVELOPMENT MODE ***");
    }
  }

  render() {
    const { host, session, user } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${session} :: flok`}</title>
        </Head>
        <Session
          websocketsHost={host}
          sessionName={session}
          userName={user}
          debug={isDevelopment}
        />
      </Layout>
    );
  }
}

SessionPage.propTypes = {
  host: PropTypes.string.isRequired,
  session: PropTypes.string.isRequired,
  user: PropTypes.string
};

SessionPage.defaultProps = {
  user: "anonymous"
};

export default SessionPage;
