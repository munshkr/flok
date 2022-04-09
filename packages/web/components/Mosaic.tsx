import { Component, Fragment } from "react";
import dynamic from "next/dynamic";
import SessionClient from "../lib/SessionClient";

const TextEditor = dynamic(() => import("./TextEditor"), {
  ssr: false,
});

const Row = ({
  editors,
  isHalfHeight,
  sessionClient,
  onEvaluateCode,
  onToggleEditorVisible,
  readonly,
}) => (
  <div className="container">
    {editors.map(({ id, target }) => (
      <div key={id} className={`slot is-${12 / editors.length}`}>
        <TextEditor
          editorId={id}
          target={target}
          isHalfHeight={isHalfHeight}
          sessionClient={sessionClient}
          onEvaluateCode={onEvaluateCode}
          onToggleEditorVisible={onToggleEditorVisible}
          readonly={readonly}
        />
      </div>
    ))}
    <style jsx>{`
      .container {
        margin: 0;
        padding: 0;
        cursor: text;
        display: flex;
        flex-wrap: wrap;
        height: ${isHalfHeight ? "50vh" : "100vh"};
      }
      .slot {
        flex: 0 0 100%;
        height: 100%;
      }
      .is-12 {
        flex-basis: 100%;
      }
      .is-6 {
        flex-basis: 50%;
      }
      .is-4 {
        flex-basis: 33.33%;
      }
      .is-3 {
        flex-basis: 25%;
      }

      @media screen and (max-width: 800px) {
        .container {
          height: 100vh;
          display: static;
        }
        .slot {
          width: 100vw;
          flex: 1 0 100%;
        }
      }
    `}</style>
  </div>
);

type Props = {
  layout: any;
  sessionClient: SessionClient;
  onEvaluateCode: any;
  onToggleEditorVisible: any;
  readonly?: boolean;
  visible?: boolean;
};

class Mosaic extends Component<Props> {
  editorsByRows() {
    const { editors } = this.props.layout;
    let editorsByRows = [];

    switch (editors.length) {
      case 1:
      case 2:
        editorsByRows = [editors];
        break;
      case 3:
        editorsByRows = [editors.slice(0, 2), [editors[2]]];
        break;
      case 4:
        editorsByRows = [editors.slice(0, 2), editors.slice(2, 4)];
        break;
      case 5:
        editorsByRows = [editors.slice(0, 3), editors.slice(3, 5)];
        break;
      case 6:
        editorsByRows = [editors.slice(0, 3), editors.slice(3, 6)];
        break;
      case 7:
        editorsByRows = [editors.slice(0, 4), editors.slice(4, 7)];
        break;
      case 8:
        editorsByRows = [editors.slice(0, 4), editors.slice(4, 8)];
        break;
      default:
        alert("More than 8 slots are not supported right now. Sorry!");
    }

    return editorsByRows;
  }

  render() {
    const {
      sessionClient,
      onEvaluateCode,
      onToggleEditorVisible,
      readonly,
      visible,
    } = this.props;

    const rows = this.editorsByRows();

    return (
      <div className="container">
        {rows.map((editors, i) => (
          <Row
            key={i}
            editors={editors}
            sessionClient={sessionClient}
            onEvaluateCode={onEvaluateCode}
            onToggleEditorVisible={onToggleEditorVisible}
            isHalfHeight={rows.length === 2}
            readonly={readonly}
          />
        ))}
        <style jsx>{`
          div {
            opacity: ${visible ? "100%" : "0%"};
            transition: opacity 0.2s ease-in-out;
          }
        `}</style>
      </div>
    );
  }
}

export default Mosaic;
