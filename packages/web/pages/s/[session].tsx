import React, { Component } from "react";
import Head from "next/head";
import getConfig from "next/config";
import { NextPageContext } from "next";

import Layout from "../../components/Layout";
import Session from "../../components/Session";
import { IceServerType } from "../../lib/SessionClient";

const { publicRuntimeConfig } = getConfig();
const {
  isDevelopment,
  iceStunUrl,
  iceTurnUrl,
  iceStunCredentials,
  iceTurnCredentials
} = publicRuntimeConfig;

const parseIceServerFromEnvVars = (url: string, userPass?: string) => {
  if (!url) return;
  let server: IceServerType = { urls: url };
  if (userPass) {
    const [username, credential] = userPass.split(":");
    server = { ...server, username, credential };
  }
  return server;
};

const extraIceServers = (() => {
  let res = [];
  const stunUrl = parseIceServerFromEnvVars(iceStunUrl, iceStunCredentials);
  if (stunUrl) res.push(stunUrl);
  const turnUrl = parseIceServerFromEnvVars(iceTurnUrl, iceTurnCredentials);
  if (turnUrl) res.push(turnUrl);
  return res;
})();

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
          extraIceServers={extraIceServers}
          layout={{
            editors: [
              { id: "1", target: "sclang" },
              { id: "2", target: "sclang" },
              { id: "3", target: "sclang" },
              { id: "4", target: "sclang" },
              { id: "5", target: "hydra" },
              { id: "6", target: "hydra" }
            ]
          }}
        />
      </Layout>
    );
  }
}

export default SessionPage;
