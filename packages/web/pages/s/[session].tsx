import React, { Component, ChangeEvent, FormEvent, useState } from "react";
import Head from "next/head";
import getConfig from "next/config";
import { NextPageContext } from "next";
import hasWebgl from "../../lib/webgl-detector";

import Layout from "../../components/Layout";
import Container from "../../components/Container";
import Session from "../../components/Session";
import { IceServerType } from "../../lib/SessionClient";
import HydraWrapper from "../../lib/HydraWrapper";
import HydraCanvas from "../../components/HydraCanvas";
import HydraError from "../../components/HydraError";
import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";

const defaultLayoutList = ["tidal", "hydra"];

const { publicRuntimeConfig } = getConfig();
const {
  flokVersion,
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
  onUsernameChange: Function;
  hydraVisible: boolean;
  hasWebGl: boolean;
}> {
  state = {
    hydraEnabled: true,
    audioStreamingEnabled: false,
  };

  handleChangeUser = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const username = target.value;
    this.props.onUsernameChange(username);
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

    let { username } = this.props;
    const { hydraEnabled, audioStreamingEnabled } = this.state;
    if (!username) username = "anonymous";

    onSubmit({ username, hydraEnabled, audioStreamingEnabled });
  };

  render() {
    const { username, hydraVisible, hasWebGl } = this.props;
    const { hydraEnabled, audioStreamingEnabled } = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <TextInput
          name="user"
          onChange={this.handleChangeUser}
          value={username}
          type="text"
          placeholder={"Type a nick name and press Enter"}
          autoFocus
        />
        {hydraVisible && (
          <Checkbox
            onChange={this.handleChangeHydraCheckbox}
            checked={hasWebGl && hydraEnabled}
            disabled={!hasWebGl}
          >
            Enable Hydra{" "}
            {!hasWebGl && (
              <span>(WebGL is disabled or not supported on this browser!)</span>
            )}
          </Checkbox>
        )}
        <Checkbox
          onChange={this.handleChangeAudioStreamingCheckbox}
          checked={audioStreamingEnabled}
        >
          Enable Audio Streaming (experimental!)
        </Checkbox>
        <Button type="submit">Join!</Button>
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
}) => {
  const [username, setUsername] = useState(lastUsername);

  return (
    <Container>
      <section className="section">
        <div className="container">
          <h1 className="title">
            flok <span>v{flokVersion} </span>
          </h1>
          <p>
            You are trying to join session with token: <code>{session}</code>.
            <br />
            Please enter your nickname.
          </p>

          <JoinSessionForm
            hydraVisible={hasHydraSlot}
            hasWebGl={hasWebGl}
            username={username}
            onUsernameChange={(name) => setUsername(name)}
            onSubmit={onSubmit}
          />
          <p>
            To connect a REPL, for example, <code>tidal</code>, run on a
            terminal:
          </p>
          <code>
            flok-repl -H {websocketsUrl} -s {session} -t tidal
            {username ? ` -N ${username}` : ""}
          </code>
          <p>
            For more information, read{" "}
            <a
              target="_blank"
              href="https://github.com/munshkr/flok#connect-repls-to-flok"
            >
              here
            </a>
            .
          </p>
        </div>
      </section>
      <style jsx>{`
        code {
          margin-bottom: 0.25rem;
          background-color: #333;
          color: #eee;
          font-family: monospace;
          padding: 0.25em 0.5em;
          border-radius: 2px;
        }
        .content {
          margin-bottom: 1rem;
        }
        h1 span {
          font-size: 0.5em;
        }
      `}</style>
    </Container>
  );
};

const LoadingSpinner = () => (
  <h1>
    Loading...
    <style jsx>{`
      h1 {
        color: #333;
        font-size: 4rem;
        position: absolute;
        top: 45%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    `}</style>
  </h1>
);

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
    const websocketsUrl = `${protocol}//${host || location.host}`;
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
            websocketsHost={host || location.host}
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
        {hasWebgl && (
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
