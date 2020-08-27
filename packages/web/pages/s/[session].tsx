import React, { Component, ChangeEvent, FormEvent } from "react";
import Head from "next/head";
import getConfig from "next/config";
import { NextPageContext } from "next";
import hasWebgl from "../../lib/webgl-detector";

import Layout from "../../components/Layout";
import Session from "../../components/Session";
import { IceServerType } from "../../lib/SessionClient";
import HydraWrapper from "../../lib/HydraWrapper";
import HydraCanvas from "../../components/HydraCanvas";
import HydraError from "../../components/HydraError";

const defaultLayoutList = ["tidal", "hydra"];

const { publicRuntimeConfig } = getConfig();
const {
  isDevelopment,
  iceStunUrl,
  iceTurnUrl,
  iceStunCredentials,
  iceTurnCredentials,
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

class JoinSessionForm extends Component<{
  username: string;
  onSubmit: Function;
  hydraVisible: boolean;
  hasWebGl: boolean;
}> {
  state = {
    username: null,
    hydraEnabled: true,
    audioStreamingEnabled: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      username: props.username || "",
    };
  }

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ username: target.value });
  };

  handleChangeHydraCheckbox = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ hydraEnabled: target.checked });
  };

  handleChangeAudioStreamingCheckbox = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    this.setState({ audioStreamingEnabled: target.checked });
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { onSubmit } = this.props;

    let { username, hydraEnabled, audioStreamingEnabled } = this.state;
    if (!username) username = "anonymous";

    onSubmit({ username, hydraEnabled, audioStreamingEnabled });
  };

  render() {
    const { hydraVisible, hasWebGl } = this.props;
    const { username, hydraEnabled, audioStreamingEnabled } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field">
          <div className="control">
            <input
              name="user"
              onChange={this.handleChangeUser}
              value={username}
              className="input is-large"
              type="text"
              placeholder={"Type a nick name and press Enter"}
              autoFocus
            />
          </div>
        </div>

        {hydraVisible && (
          <div className="field">
            <div className="control">
              <label className="checkbox">
                <input
                  className="is-large"
                  onChange={this.handleChangeHydraCheckbox}
                  checked={hasWebGl && hydraEnabled}
                  type="checkbox"
                  disabled={!hasWebGl}
                />
                Enable Hydra{" "}
                {!hasWebGl && (
                  <span>
                    (WebGL is disabled or not supported on this browser!)
                  </span>
                )}
              </label>
            </div>
          </div>
        )}

        <div className="field">
          <div className="control">
            <label className="checkbox">
              <input
                className="is-large"
                onChange={this.handleChangeAudioStreamingCheckbox}
                checked={audioStreamingEnabled}
                type="checkbox"
              />
              Enable Audio Streaming (experimental!)
            </label>
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

const EmptySession = ({
  websocketsUrl,
  session,
  lastUsername,
  hasWebGl,
  hasHydraSlot,
  onSubmit,
}) => (
  <section className="section">
    <div className="container">
      <h1 className="title">flok</h1>
      <h3 className="subtitle">
        You are trying to join session with token: <code>{session}</code>.<br />
        Please enter your nickname.
      </h3>
      <p className="content">
        To connect a REPL, for example, <code>tidal</code>, run on a terminal:
        <br />
        <code>
          flok-repl -H {websocketsUrl} -s {session} -t tidal
        </code>
        <br />
        For more information, read{" "}
        <a
          target="_blank"
          href="https://github.com/munshkr/flok#connect-repls-to-flok"
        >
          here
        </a>
        .
      </p>
      <JoinSessionForm
        hydraVisible={hasHydraSlot}
        hasWebGl={hasWebGl}
        username={lastUsername}
        onSubmit={onSubmit}
      />
    </div>
  </section>
);

const LoadingSpinner = () => <h4>Loading...</h4>;

interface Props {
  host: string;
  session: string;
  layoutParam: string;
}

interface State {
  loading: boolean;
  lastUsername: string;
  hasWebGl: boolean;
  hydraEnabled: boolean;
  hydraError: string;
  audioStreamingEnabled: boolean;
  username: string;
  websocketsUrl: string;
}

class SessionPage extends Component<Props, State> {
  hydraCanvas: React.RefObject<HTMLCanvasElement>;
  hydra: HydraWrapper;

  state = {
    loading: true,
    lastUsername: null,
    hasWebGl: true,
    hydraEnabled: true,
    hydraError: "",
    audioStreamingEnabled: false,
    username: null,
    websocketsUrl: null,
  };

  static async getInitialProps({ req, query }: NextPageContext) {
    const host = req && req.headers && req.headers.host;
    return {
      host,
      session: query.session,
      layoutParam: query.layout,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      hasWebGl: hasWebgl(),
    };

    this.hydraCanvas = React.createRef();
    this.hydra = null;
  }

  componentDidMount() {
    if (isDevelopment) {
      console.log("*** DEVELOPMENT MODE ***");
    }

    if (this.state.hasWebGl) {
      this.hydra = new HydraWrapper(
        this.hydraCanvas.current,
        this.handleHydraError
      );
      console.log("Hydra wrapper created");
    } else {
      console.warn("WebGL is disabled or not supported in this browser");
    }

    // Set Websockets URL
    const { host } = this.props;
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const websocketsUrl = `${protocol}//${host}`;
    this.setState({ websocketsUrl });

    this.fetchLastUserName();
  }

  fetchLastUserName() {
    const username = window.localStorage.getItem("lastUsername");
    if (username) {
      this.setState({ lastUsername: username, loading: false });
    } else {
      this.setState({ loading: false });
    }
  }

  handleJoinSubmit = ({
    username,
    hydraEnabled,
    audioStreamingEnabled,
  }: {
    username: string;
    hydraEnabled: boolean;
    audioStreamingEnabled: boolean;
  }) => {
    window.localStorage.setItem("lastUsername", username);

    this.setState({ username, hydraEnabled, audioStreamingEnabled });
  };

  handleHydraEvaluation = (code: string) => {
    const { hydraEnabled, hasWebGl } = this.state;
    if (hasWebGl && hydraEnabled) {
      this.hydra.tryEval(code);
    }
  };

  handleHydraError = (error: string) => {
    this.setState({ hydraError: error });
  };

  generateLayoutFromList = (list: string[]) => {
    return {
      editors: list.map((target: string, i: number) => ({
        id: String(i),
        target,
      })),
    };
  };

  render() {
    const { host, session, layoutParam } = this.props;
    const {
      loading,
      username,
      hasWebGl,
      hydraError,
      audioStreamingEnabled,
      lastUsername,
      websocketsUrl,
    } = this.state;

    let layoutList = defaultLayoutList;
    if (layoutParam) {
      layoutList = layoutParam.split(",");
    }
    const hasHydraSlot = layoutList.includes("hydra");
    const layout = this.generateLayoutFromList(layoutList);

    return (
      <Layout>
        <Head>
          <title>Flok</title>
        </Head>
        {loading ? (
          <LoadingSpinner />
        ) : username ? (
          <Session
            websocketsHost={host}
            sessionName={session}
            userName={username}
            extraIceServers={extraIceServers}
            layout={layout}
            audioStreamingEnabled={audioStreamingEnabled}
            onHydraEvaluation={this.handleHydraEvaluation}
          />
        ) : (
          <EmptySession
            websocketsUrl={websocketsUrl}
            session={session}
            lastUsername={lastUsername}
            onSubmit={this.handleJoinSubmit}
            hasHydraSlot={hasHydraSlot}
            hasWebGl={hasWebGl}
          />
        )}
        {hasWebgl && hasHydraSlot && (
          <>
            <HydraCanvas ref={this.hydraCanvas} fullscreen />
            {hydraError && <HydraError>{hydraError}</HydraError>}
          </>
        )}
      </Layout>
    );
  }
}

export default SessionPage;
