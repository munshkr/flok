import React, { Component, MouseEvent } from "react";
import css from "styled-jsx/css";
import {
  faCaretSquareDown,
  faCaretSquareUp,
  faWindowRestore,
  faWindowMaximize,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";

export type Message = {
  target: string;
  content: string;
};

const ButtonGroup = ({ children }) => {
  const { className, styles } = css.resolve`
    a {
      font-size: 16px;
      margin: 0 0.125em;
      color: #888;
    }
    a:hover {
      color: #fefefe;
    }
  `;

  return (
    <div className="button-group">
      {children.map((child, i) =>
        React.cloneElement(child, { key: i, className })
      )}
      <style jsx>{`
        .button-group {
          float: right;
          margin-right: 0.125em;
        }
      `}</style>
      {styles}
    </div>
  );
};

const Tabs = ({ children, value }) => (
  <div>
    <ul>
      {children.map((child, i) => (
        <li key={i}>{React.cloneElement(child, { active: value === i })}</li>
      ))}
    </ul>
    <style jsx>{`
      div {
        margin-bottom: 0.25em;
      }
      ul {
        border-bottom-color: #00000000;
        list-style: none;
      }
    `}</style>
  </div>
);

const Tab = ({ active = false, ...props }) => (
  <>
    <a {...props} />
    <style jsx>{`
      a {
        padding: 0.1em 0.25em;
        cursor: pointer;
      }
      a:hover {
        color: #fefefe;
        border-bottom-color: #00000000;
      }
    `}</style>
    <style jsx>{`
      a {
        color: ${active ? "#3273dc" : "#888"};
        border-bottom-color: ${active ? "#3273dc" : "#00000000"};
      }
    `}</style>
  </>
);

type DivProps = React.HTMLProps<HTMLDivElement>;

const TabsContent = React.forwardRef<HTMLDivElement, DivProps>((props, ref) => (
  <div ref={ref} {...props}>
    {props.children}
    <style jsx>{`
      div {
        height: 100%;
        overflow: auto;
      }
    `}</style>
  </div>
));

const MessageListItem = ({ type, body }) => {
  const error = type === "stderr";

  return (
    <pre>
      {body.join("\n")}
      <style jsx>{`
        pre {
          padding: 0;
          background-color: transparent;
          white-space: pre-wrap;
          white-space: -moz-pre-wrap;
          white-space: -pre-wrap;
          white-space: -o-pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
      <style jsx>{`
        pre {
          color: ${error ? "#f14668" : "#bbbbbb"};
        }
      `}</style>
    </pre>
  );
};

const MessagesList = ({ children }) => (
  <ol className="messages">
    {children.map(({ _target, content }, i) => (
      <li key={i}>
        <MessageListItem type={content.type} body={content.body} />
      </li>
    ))}
    <style jsx>{`
      ol {
        list-style: none;
        padding: 0;
      }
    `}</style>
  </ol>
);

type Props = {
  messagesByClientId: { [clientId: string]: any[] };
  isTop: boolean;
  isMaximized: boolean;
  onTogglePosition: (e: MouseEvent) => any;
  onToggleMaximize: (e: MouseEvent) => any;
  onClose: (e: MouseEvent) => any;
};

type State = {
  currentClientId: string;
};

class TargetMessagesPane extends Component<Props, State> {
  static defaultProps = {
    messages: [],
    isTop: false,
    isMaximized: false,
    onTogglePosition: () => {},
    onToggleMaximize: () => {},
    onClose: () => {},
  };
  container: HTMLElement;
  containerRef: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);

    const clientIds = Object.keys(this.props.messagesByClientId);
    this.state = {
      currentClientId: clientIds.length > 0 ? clientIds[0] : null,
    };

    this.containerRef = React.createRef();
  }

  componentDidUpdate(prevProps: Props) {
    const { messagesByClientId } = this.props;
    if (this.container && prevProps.messagesByClientId !== messagesByClientId) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }

  handleTabClick = (clientId) => {
    this.setState({ currentClientId: clientId });
  };

  render() {
    const {
      messagesByClientId,
      isTop,
      isMaximized,
      onTogglePosition,
      onToggleMaximize,
      onClose,
    } = this.props;
    const { currentClientId } = this.state;

    const clientIds = Object.keys(messagesByClientId);

    return (
      <div
        className={`target-messages-pane ${isTop ? "top" : "bottom"} ${
          isMaximized ? "maximized" : ""
        }`}
      >
        <ButtonGroup>
          <Button
            icon={isTop ? faCaretSquareDown : faCaretSquareUp}
            onClick={onTogglePosition}
          />
          <Button
            icon={isMaximized ? faWindowRestore : faWindowMaximize}
            onClick={onToggleMaximize}
          />
          <Button icon={faWindowClose} onClick={onClose} />
        </ButtonGroup>
        <Tabs value={clientIds.indexOf(currentClientId)}>
          {clientIds.map((clientId, i) => (
            <Tab key={clientId} onClick={() => this.handleTabClick(clientId)}>
              {clientId.slice(0, 7)}
            </Tab>
          ))}
        </Tabs>
        <TabsContent ref={this.containerRef}>
          <MessagesList>{messagesByClientId[currentClientId]}</MessagesList>
        </TabsContent>

        <style jsx>{`
          div {
            position: absolute;
            left: 0;
            background: #00000090;
            color: #888;
            z-index: 1000;
            font-family: monospace;
            font-size: 0.8em;
            height: 20em;
            width: 100%;
          }
          .top {
            top: 0;
          }
          .bottom {
            bottom: 0;
          }
          .maximized {
            height: 100%;
          }
        `}</style>
      </div>
    );
  }
}

export default TargetMessagesPane;
