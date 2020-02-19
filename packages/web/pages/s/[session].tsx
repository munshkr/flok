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
  wsServer: string;
  session: string;
  user: string;
}

class SessionPage extends Component<Props> {
  static defaultProps = {
    user: "anonymous"
  };

  state = {
    isSecure: null
  };

  static async getInitialProps({ req, query }: NextPageContext) {
    const host = req && req.headers && req.headers.host;
    return {
      host,
      session: query.session,
      user: query.user,
      wsServer: query.wsServer
    };
  }

  componentDidMount() {
    if (isDevelopment) {
      console.log("*** DEVELOPMENT MODE ***");
    }
  }

  render() {
    const { host, wsServer, session, user } = this.props;

    const pubsubServerUrl = `wss://${host}/pubsub`;
    const signalingServerUrl = wsServer;

    return (
      <Layout>
        <Head>
          <title>{`${session} :: flok`}</title>
        </Head>
        <Session
          pubsubServerUrl={pubsubServerUrl}
          signalingServerUrl={signalingServerUrl}
          sessionName={session}
          userName={user}
          layout={{
            editors: [
              { id: "1", target: "tidal" },
              { id: "2", target: "tidal" },
              { id: "3", target: "tidal" },
              { id: "4", target: "hydra" }
            ]
          }}
        />
      </Layout>
    );
  }
}

export default SessionPage;
