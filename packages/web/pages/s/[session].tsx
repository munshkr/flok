import React, { Component } from "react";
import Head from "next/head";
import getConfig from "next/config";
import { NextPageContext } from "next";

import Layout from "../../components/Layout";
import Session from "../../components/Session";

const { publicRuntimeConfig } = getConfig();
const { isDevelopment } = publicRuntimeConfig;

interface Props {
  host: string;
  session: string;
  user: string;
}

class SessionPage extends Component<Props> {
  static defaultProps = {
    user: "anonymous"
  };

  static async getInitialProps({ req, query }: NextPageContext) {
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
          layout={{
            editors: [
              { id: "1", target: "default" },
              { id: "2", target: "default" },
              { id: "3", target: "default" },
              { id: "4", target: "default" },
              { id: "5", target: "default" },
              { id: "6", target: "default" }
            ]
          }}
        />
      </Layout>
    );
  }
}

export default SessionPage;
