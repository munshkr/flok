import React, { Component, ChangeEvent, FormEvent } from "react";
import Router from "next/router";
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

class JoinSessionForm extends Component<{ session: string }> {
  state = {
    user: ""
  };

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ user: target.value });
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { session } = this.props;
    let { user } = this.state;

    if (!user) user = "anonymous";

    Router.push(`/s/${session}?user=${user}`);
  };

  render() {
    const { user } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="user"
              onChange={this.handleChangeUser}
              value={user}
              className="input is-large"
              type="text"
              placeholder="Type a nick name and press Enter"
            />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button type="submit" className="button is-link is-large">
              Join!
            </button>
          </div>
        </div>
      </form>
    );
  }
}

const EmptySession = ({ session }) => (
  <section className="section">
    <div className="container">
      <h1 className="title">flok</h1>
      <h3 className="subtitle">
        You are trying to join session <code>{session}</code>. Please enter your
        nickname.
      </h3>

      {/* <SessionList /> */}
      <JoinSessionForm session={session} />
    </div>
  </section>
);

class SessionPage extends Component<Props> {
  static defaultProps = {
    user: null
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
        {user ? (
          <Session
            websocketsHost={host}
            sessionName={session}
            userName={user}
            extraIceServers={extraIceServers}
            layout={{
              editors: [
                { id: "1", target: "tidal" },
                { id: "2", target: "tidal" },
                { id: "3", target: "tidal" },
                { id: "4", target: "hydra" }
              ]
            }}
          />
        ) : (
          <EmptySession session={session} />
        )}
      </Layout>
    );
  }
}

export default SessionPage;
